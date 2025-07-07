const express = require('express');
const router = express.Router();
const {
  placeOrder,
  getUserOrders,
  getOrdersByRestaurant,
  updateOrderStatus,
  getAcceptedOrdersByRestaurant,updateOrderStatus2,getOrderById,getOrdersByRestaurant2,   saveBasket
,getBasket,removeItemFromBasket,deleteBasket,
getAllBasketsForUser,
getAllOrders,
getLatestOrder,
mergeGuestBasket,
usedOffers} = require('../controllers/orderController');

const auth = require('../middleware/auth'); 
const restaurantAuth = require('../middleware/auth'); 
const verifyAdmin = require('../middleware/adminAuth');

router.post('/', auth, placeOrder);

router.get('/', auth, getUserOrders);
router.get('/latest', auth, getLatestOrder);
router.post('/basket', auth, saveBasket);
router.get('/basket', auth, getBasket);
router.get('/basket/all',auth, getAllBasketsForUser);
router.get('/restaurant/:restaurantId', restaurantAuth, getOrdersByRestaurant);
router.get('/restaurant/:restaurantId/accepted', restaurantAuth, getAcceptedOrdersByRestaurant);
router.get('/restaurant2/:restaurantId', restaurantAuth, getOrdersByRestaurant2);


router.delete('/basket/:id',auth, removeItemFromBasket);
router.delete('/clear',auth, deleteBasket);
router.put('/:orderId', restaurantAuth, updateOrderStatus);
router.put('/inside/:orderId', restaurantAuth, updateOrderStatus2);
router.get("/all-orders", auth,verifyAdmin, getAllOrders);
router.post('/merge-cart',restaurantAuth,mergeGuestBasket);
router.get('/used-offers',auth,usedOffers);
router.get('/:orderId', getOrderById);


module.exports = router;
