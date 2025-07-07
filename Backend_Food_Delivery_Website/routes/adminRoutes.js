const express = require('express');
const router = express.Router();
const { loginAdmin, getListedRequests,acceptListingRequest,getAcceptedRestaurants ,sendNotification, getAllNotifications, deleteListingRequest, markNotificationsAsRead} = require('../controllers/adminController');
const verifyAdmin = require('../middleware/auth');

// Admin login
router.post('/login', loginAdmin);

// Protected: Get all 'Get Listed' requests
router.get('/get-listed', verifyAdmin, getListedRequests);

router.post('/accept-request/:id',verifyAdmin, acceptListingRequest);

router.get('/restaurants', verifyAdmin, getAcceptedRestaurants);
router.post('/notifications/send', verifyAdmin, sendNotification);
router.get('/notifications/get', verifyAdmin, getAllNotifications);
router.delete('/delete-request/:id', deleteListingRequest);

router.post("/notifications/mark-read", verifyAdmin, markNotificationsAsRead);
module.exports = router;
