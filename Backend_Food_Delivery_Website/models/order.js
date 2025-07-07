const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
restaurantId: { type: String, required: true },
restaurantName: { type: String,required:true },
isRestaurantOrder: { type: Boolean, default: true },

  basket: [
    {
      _id: String,
      name: String,
      price: Number,
      quantity: Number,
      shortDescription: String,
       note: { type: String, default: '' },
    }
  ],
    offerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer', default: null },
  offerPercentage: Number,
  subTotal: Number,
  offerDeduction: Number,
  total: Number,
  deliveryFee: Number,
  paymentMethod: String,
  specialInstructions: String,
  deliveryOption: String,
  date: String,
  time: String,
  address: String,
  status: { type: String, default: 'Pending' }, 
  reason: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  
});

module.exports = mongoose.model('Order', OrderSchema);
