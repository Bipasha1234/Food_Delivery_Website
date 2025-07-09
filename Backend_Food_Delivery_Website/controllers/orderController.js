const Order = require('../models/order');
const Basket = require('../models/basket');
const Restaurant = require('../models/restaurant');
const notification = require('../models/notification');

// Place a new order
const placeOrder = async (req, res) => {
  try {
    const {
      basket,
      offerId,           
      offerPercentage,
      offerDeduction,
      subTotal,
      deliveryFee,
      total,
      restaurantId,
      paymentMethod,
      specialInstructions,
      deliveryOption,
      date,
      time,
      address,
    } = req.body;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const newOrder = new Order({
      userId: req.user.id,
      basket,
      offerId: offerId || null, // Only store if provided
      offerPercentage: offerPercentage || 0,
      offerDeduction: offerDeduction || 0,
      subTotal,
      total,
      deliveryFee,
      restaurantId,
      restaurantName: restaurant.restaurantName,
      paymentMethod,
      specialInstructions,
      deliveryOption,
      date,
      time,
      address,
      status: 'Pending',
    });

    const savedOrder = await newOrder.save();

    const io = req.app.get('io');
    io.to(restaurantId.toString()).emit('newOrder', savedOrder);

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ error: 'Failed to place order.' });
  }
};


// Get all orders for the current user
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
};

const getLatestOrder = async (req, res) => {
  try {
    const latestOrder = await Order.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
    if (!latestOrder) {
      return res.status(404).json({ message: "No orders found" });
    }
    res.json(latestOrder);
  } catch (error) {
    console.error("Error fetching latest order:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// Get all orders for a specific restaurant
const getOrdersByRestaurant = async (req, res) => {
  const { restaurantId } = req.params;
  try {
    const orders = await Order.find({ restaurantId, status: 'Pending' }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


const getOrdersByRestaurant2 = async (req, res) => {
  const { restaurantId } = req.params;

  try {
    const orders = await Order.find({
      restaurantId,
      status: { $nin: ["Pending", ""] } 
    }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};


// Update order status (accept/reject)
// const updateOrderStatus = async (req, res) => {
//   const { orderId } = req.params;
//   const { status, reason } = req.body;

//   if (!['Accepted', 'Rejected'].includes(status)) {
//     return res.status(400).json({ message: 'Invalid status' });
//   }

//   try {
//     const order = await Order.findById(orderId);
//     if (!order) return res.status(404).json({ message: 'Order not found' });

//     order.status = status;
//     order.reason = status === 'Rejected' ? (reason || '') : '';
//     await order.save();

//     res.json({ message: `Order ${status.toLowerCase()} successfully`, order });
//   } catch (error) {
//     console.error('Error updating order status:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status, reason } = req.body;

  if (!['Accepted', 'Rejected', 'Order Taken', 'Preparing', 'Handed to Delivery', 'Coming to Address','Delivered'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    order.reason = status === 'Rejected' ? (reason || '') : '';
    await order.save();

    const io = req.app.get('io'); // get socket.io instance

    // Emit order update to restaurant room
    io.to(order.restaurantId.toString()).emit('orderStatusUpdated', {
      orderId: order._id,
      status,
      reason: order.reason || null,
    });

    // Send notification for any status update
    const notificationMessage =
      status === 'Rejected'
        ? `Your order from "${order.restaurantName}" has been rejected. Reason: "${reason || 'No reason provided'}"`
        : `Your order from "${order.restaurantName}" is now "${status}".`;

    const notif = await notification.create({
      userId: order.userId,
      message: notificationMessage,
    });

    io.to(order.userId.toString()).emit('newNotification', notif);
    io.to("adminRoom").emit('newNotification', notif);

    res.json({ message: `Order ${status.toLowerCase()} successfully`, order });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAcceptedOrdersByRestaurant = async (req, res) => {
  const { restaurantId } = req.params;

  try {
    const acceptedOrders = await Order.find({ restaurantId, status: 'Accepted' }).sort({ createdAt: -1 });
    res.json(acceptedOrders);
  } catch (error) {
    console.error('Error fetching accepted orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// const updateOrderStatus2 = async (req, res) => {
//   const { orderId } = req.params;
//   const { status } = req.body;

//   // List of valid statuses
//   const validStatuses = [
//     'Cancelled',
//     'Order Taken',
//     'Preparing',
//     'Handed to Delivery',
//     'Coming to Address',
//     'Delivered',
//     'Accepted',
//     'Rejected',
//   ];

//   // Validate status
//   if (!validStatuses.includes(status)) {
//     return res.status(400).json({ message: 'Invalid status provided.' });
//   }

//   try {
//     const order = await Order.findById(orderId);

//     if (!order) {
//       return res.status(404).json({ message: 'Order not found.' });
//     }

//     order.status = status;

//     // Save updated order
//     await order.save();

//     res.json({ message: `Order status updated to ${status}.`, order });
//   } catch (error) {
//     console.error('Error updating order status:', error);
//     res.status(500).json({ message: 'Server error.' });
//   }
// };

const updateOrderStatus2 = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const validStatuses = [
    'Cancelled',
    'Order Taken',
    'Preparing',
    'Handed to Delivery',
    'Coming to Address',
    'Delivered',
    'Accepted',
    'Rejected',
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status provided.' });
  }

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    order.status = status;
    await order.save();

    const io = req.app.get('io');

    // Emit order update to all relevant rooms
    io.to(order.restaurantId.toString()).emit('orderStatusUpdated', {
      orderId: order._id,
      status,
    });

    io.to(order.userId.toString()).emit('orderStatusUpdated', {
      orderId: order._id,
      status,
    });

    io.to("adminRoom").emit('orderStatusUpdated', {
      orderId: order._id,
      status,
    });

    // 🟡 Notification Message
    let message;
    if (status === 'Rejected') {
      message = `Your order from "${order.restaurantName}" has been rejected.`;
    } else if (status === 'Accepted') {
      message = `Your order from "${order.restaurantName}" has been accepted.`;
    } else {
      message = `Your order from "${order.restaurantName}" is now "${status}".`;
    }

    // 🔔 Create and emit notification
    const notif = await notification.create({
      userId: order.userId,
      message,
    });

    io.to(order.userId.toString()).emit('newNotification', notif);
    io.to("adminRoom").emit('newNotification', notif);

    res.json({ message: `Order status updated to ${status}.`, order });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};


const getOrderById = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


const saveBasket = async (req, res) => {
  try {
    const { items, offerPercentage = 0, offerDeduction=0,restaurantId } = req.body;

if (!items || !Array.isArray(items) || !restaurantId) {
  return res.status(400).json({ message: 'Basket items and restaurantId are required.' });
}
// Now find basket for this user AND restaurant
let basket = await Basket.findOne({ userId: req.user.id, restaurantId });

if (basket) {
  basket.items = items;
  basket.offerPercentage = offerPercentage;
    basket.offerDeduction = offerDeduction;
} else {
  basket = new Basket({
    userId: req.user.id,
    restaurantId, 
    items,
    offerPercentage,
    offerDeduction
});
}
    await basket.save();
    res.status(200).json({ message: 'Basket saved successfully', basket });
  } catch (err) {
    console.error('Error saving basket:', err);
    res.status(500).json({ message: 'Server error while saving basket.' });
  }
};

const getBasket = async (req, res) => {
  try {
   const { restaurantId } = req.query;

if (!restaurantId) {
  return res.status(400).json({ message: 'Restaurant ID is required.' });
}

const basket = await Basket.findOne({ userId: req.user.id, restaurantId });

if (!basket) {
  return res.status(404).json({ message: 'Basket not found.' });
}

    res.json(basket);
  } catch (err) {
    console.error('Error getting basket:', err);
    res.status(500).json({ message: 'Server error while fetching basket.' });
  }
};

const removeItemFromBasket = async (req, res) => {
  try {
    const { id } = req.params;

    //  Find the basket that contains this item for the current user
    const basket = await Basket.findOne({
      userId: req.user.id,
      "items._id": id
    });

    if (!basket) {
      return res.status(404).json({ message: 'Basket with item not found.' });
    }

    // Remove the item from the correct basket
    basket.items = basket.items.filter(item => item._id.toString() !== id);
    await basket.save();

    res.json({ message: 'Item removed from basket', basket });
  } catch (err) {
    console.error('Error removing item:', err);
    res.status(500).json({ message: 'Server error while removing item.' });
  }
};

const getAllBasketsForUser = async (req, res) => {
  try {
    const baskets = await Basket.find({ userId: req.user.id });

    if (!baskets.length) {
      return res.json([]); 
    }

    const enrichedBaskets = await Promise.all(
      baskets.map(async (basket) => {
        const restaurant = await Restaurant.findById(basket.restaurantId).lean();

        return {
          restaurantId: basket.restaurantId,
          restaurantName: restaurant?.restaurantName || "Unknown",
          city: restaurant?.city || "Unknown",
          items: basket.items,
          offerPercentage: basket.offerPercentage || 0,
          offerDeduction:basket.offerDeduction || 0
        };
      })
    );

    res.json(enrichedBaskets);
  } catch (err) {
    console.error('Error getting all baskets:', err);
    res.status(500).json({ message: 'Server error while fetching all baskets.' });
  }
};

const deleteBasket = async (req, res) => {
  try {
    const { restaurantId } = req.query;

    if (!restaurantId) {
      return res.status(400).json({ message: 'restaurantId query parameter is required.' });
    }

    // Delete basket(s) only for this user and restaurant
    const result = await Basket.deleteMany({ userId: req.user.id, restaurantId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'No basket found to delete for this restaurant.' });
    }

    res.status(200).json({ message: 'Basket cleared successfully for the restaurant.' });
  } catch (err) {
    console.error('Error clearing basket:', err);
    res.status(500).json({ message: 'Server error while clearing basket.' });
  }
};

// GET all orders from entire website (admin)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }); // newest first
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({ message: "Server error while fetching all orders." });
  }
};
// Merge guest basket with user’s saved basket
const mergeGuestBasket = async (req, res) => {
  try {
    const { restaurantId, items } = req.body;
    const userId = req.user.id;

    if (!restaurantId || !Array.isArray(items)) {
      return res.status(400).json({ message: 'restaurantId and items are required.' });
    }

    // Find existing basket for the user and restaurant
    let basket = await Basket.findOne({ userId, restaurantId });

    if (!basket) {
      // If no basket exists, create a new one using guest items
      basket = new Basket({ userId, restaurantId, items });
    } else {
      // Merge guest items into existing basket
      const existingItemsMap = new Map();

      // Add existing items
      for (const item of basket.items) {
        existingItemsMap.set(item.itemId?.toString() || item._id.toString(), { ...item.toObject() });
      }

      // Add or update from guest items
      for (const guestItem of items) {
        const id = guestItem.itemId?.toString() || guestItem._id.toString();
        if (existingItemsMap.has(id)) {
          existingItemsMap.get(id).quantity += guestItem.quantity;
        } else {
          existingItemsMap.set(id, guestItem);
        }
      }

      basket.items = Array.from(existingItemsMap.values());
    }

    await basket.save();
    res.status(200).json({ message: 'Basket merged successfully.', basket });

  } catch (err) {
    console.error('Error merging guest basket:', err);
    res.status(500).json({ message: 'Server error while merging basket.' });
  }
};
const usedOffers=  async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({ userId, offerId: { $ne: null } }).select('offerId');

    const usedOfferIds = orders.map(order => order.offerId.toString());

    res.status(200).json(usedOfferIds);
  } catch (error) {
    console.error('Error fetching used offers:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
module.exports = {
  placeOrder,
  getUserOrders,
  getOrdersByRestaurant,
  updateOrderStatus,
  getAcceptedOrdersByRestaurant,
  updateOrderStatus2,
  getOrderById,
  getOrdersByRestaurant2,
  saveBasket,
  getBasket,
  removeItemFromBasket,getAllBasketsForUser,deleteBasket,getAllOrders,
  getLatestOrder,
  mergeGuestBasket,
  usedOffers
};
