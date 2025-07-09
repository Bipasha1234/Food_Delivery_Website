const GetListedRequest = require('../models/getListed');
const Restaurant = require('../models/restaurant')
const Notification = require('../models/notification'); 
const User = require('../models/customer'); 
const jwt = require('jsonwebtoken');
//code for admin side added 
const loginAdmin = (req, res) => {
  const { email, password } = req.body;
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    return res.json({ token });
  }

  res.status(401).json({ message: 'Invalid admin credentials' });
};

const getListedRequests = async (req, res) => {
  try {
    const requests = await GetListedRequest.find().sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const acceptListingRequest = async (req, res) => {
  try {
    const request = await GetListedRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    const newRestaurant = new Restaurant({
      ownerName: request.ownerName,
      restaurantName: request.restaurantName,
      ownerEmail: request.ownerEmail,
      phone1: request.phone1,
      details: request.details,
    });

    await newRestaurant.save();
    await GetListedRequest.findByIdAndDelete(req.params.id);

    res.json({ message: "Accepted and added to restaurant list" });
  } catch (err) {
    console.error("Accept Listing Error:", err); 
    res.status(500).json({ error: err.message });
  }
};

const getAcceptedRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find().sort({ createdAt: -1 });
    res.status(200).json(restaurants);
  } catch (err) {
    console.error("Error fetching accepted restaurants:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const sendNotification = async (req, res) => {
  const { message } = req.body;

  if (!message || message.trim() === '') {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const newNotification = new Notification({
      message,
      recipients: ['customer', 'restaurant'], 
      createdAt: new Date(),
      read: false,
    });

    await newNotification.save();

    // Emit new notification event
    const io = req.app.get('io');
    io.emit('newNotification', newNotification);

    return res.status(200).json({ message: 'Notification saved successfully' });
  } catch (error) {
    console.error('Error saving notification:', error);
    return res.status(500).json({ error: 'Server error while saving notification' });
  }
};

const getAllNotifications = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    const query = {
      $or: [
        { userId }, 
        { recipients: { $in: [role] } }
      ],
    };

    const notifications = await Notification.find(query).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ message: "Server error while fetching notifications." });
  }
};

const deleteListingRequest = async (req, res) => {
  try {
    const request = await GetListedRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    await GetListedRequest.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Request deleted successfully' });
  } catch (error) {
    console.error('Delete Listing Error:', error);
    res.status(500).json({ error: 'Server error while deleting request' });
  }
};

const markNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await Notification.updateMany(
      {
        $or: [{ userId, read: false }, { recipients: { $in: [role] }, read: false }],
      },
      { $set: { read: true } }
    );

    res.status(200).json({ message: "Notifications marked as read" });
  } catch (error) {
    console.error("Mark notifications as read error:", error);
    res.status(500).json({ message: "Server error while marking notifications as read" });
  }
};

module.exports = {
  loginAdmin,
  getListedRequests,
  acceptListingRequest,
  getAcceptedRestaurants,
  sendNotification,
  getAllNotifications,
  deleteListingRequest,
  markNotificationsAsRead
};
