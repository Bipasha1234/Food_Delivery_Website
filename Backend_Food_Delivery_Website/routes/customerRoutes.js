const express = require('express');
const router = express.Router();
const { registerCustomer, loginCustomer,getCustomerProfile,updateCustomerProfile, addFavorites, removeFavorites, getFavorites, getAllCustomers, getCustomerStats, resetPassword, forgotPassword} = require('../controllers/customerController');
const protect = require('../middleware/auth');
const verifyAdmin = require('../middleware/adminAuth');
router.post('/register', registerCustomer);
router.post('/login', loginCustomer);
router.get('/profile', protect, getCustomerProfile);
router.put('/profile', protect, updateCustomerProfile);
router.post('/favorites/add', protect, addFavorites);
router.post('/favorites/remove', protect,removeFavorites);
router.get('/get/favorites', protect,getFavorites);

router.get('/admin/customers', verifyAdmin, protect,getAllCustomers);

router.get('/admin/customers/stats', verifyAdmin, getCustomerStats);

router.post('/forgot-password', forgotPassword);

router.post('/change-password',resetPassword);

module.exports = router;
