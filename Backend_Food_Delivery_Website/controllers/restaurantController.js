const Restaurant = require('../models/restaurant');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');
const socketio = require('../config/socketio'); 
const SECRET = process.env.JWT_SECRET || 'secret';

//  Fetch all accepted restaurants
const getAcceptedRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find().sort({ createdAt: -1 });
    res.status(200).json(restaurants);
  } catch (err) {
    console.error("Error fetching accepted restaurants:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const registerRestaurant = async (req, res) => {
  try {
    const {
      restaurantName, city, fssai, category,
      ownerName, phone, phone2, ownerEmail1, password
    } = req.body;

    // block if restaurant name is not in approved list
    const approved = await Restaurant.findOne({ restaurantName });
    if (!approved) {
      return res.status(403).json({ message: "Your restaurant not approved by admin." });
    }

    // Prevent duplicate phone or email
    const existingPhone = await Restaurant.findOne({ phone });
    if (existingPhone && existingPhone._id.toString() !== approved._id.toString()) {
      return res.status(400).json({ message: "Phone already registered" });
    }

    if (ownerEmail1) {
      const existingEmail = await Restaurant.findOne({ ownerEmail1 });
      if (existingEmail && existingEmail._id.toString() !== approved._id.toString()) {
        return res.status(400).json({ message: "Email already registered" });
      }
    }

    //  Hash password
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    // Update the approved restaurant entry with login fields
    approved.city = city;
    approved.fssai = fssai;
    approved.category = category;
    approved.ownerName = ownerName;
    approved.phone = phone;
    approved.phone2 = phone2;
    approved.ownerEmail1 = ownerEmail1;
    approved.password = hashedPassword;

    await approved.save();

    res.status(201).json({ message: "Restaurant registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
};


//  Email Login
const loginWithEmail = async (req, res) => {
  const { ownerEmail1, password } = req.body;
  try {
    const user = await Restaurant.findOne({ ownerEmail1 });
    if (!user) return res.status(404).json({ message: "No such Restaurant" });

    const match = await bcrypt.compare(password, user.password || '');
    if (!match) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

// Phone Login - Send OTP
const sendOtp = async (req, res) => {
  const { phone } = req.body;
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const expiry = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

  try {
    const restaurant = await Restaurant.findOneAndUpdate(
      { phone },
      { otp, otp_expiry: expiry },
      { new: true, upsert: true }
    );

    // Simulate SMS send
    console.log(`OTP for ${phone}: ${otp}`);
    res.json({ message: "OTP sent" });
  } catch (err) {
    res.status(500).json({ message: "Failed to send OTP", error: err.message });
  }
};

// Verify OTP
const verifyOtp = async (req, res) => {
  const { phone, otp } = req.body;

  try {
    const restaurant = await Restaurant.findOne({ phone, otp });
    if (!restaurant || restaurant.otp_expiry < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    restaurant.otp = null;
    restaurant.otp_expiry = null;
    await restaurant.save();

    const token = jwt.sign({ id: restaurant._id }, SECRET, { expiresIn: '7d' });
    res.json({ token, user: restaurant });
  } catch (err) {
    res.status(500).json({ message: "OTP verification failed", error: err.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.user.id).select("-password");
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};


const updateProfile = async (req, res) => {
  try {
    const { ownerName, phone, phone2, ownerEmail1 } = req.body;

    const restaurant = await Restaurant.findById(req.user.id);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    restaurant.ownerName = ownerName || restaurant.ownerName;
    restaurant.phone = phone || restaurant.phone;
    restaurant.phone2 = phone2 || restaurant.phone2;
    restaurant.ownerEmail1 = ownerEmail1 || restaurant.ownerEmail1;

    await restaurant.save();

    res.json({ message: "Profile updated successfully", restaurant });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

const me = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.user.id).select('-password -otp -otp_expiry');
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch restaurant', error: err.message });
  }
};


const getRestaurantId= async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch restaurant details.' });
  }
};


const updateRestaurant = async (req, res) => {
  try {
    const { restaurantName, city, fssai, category } = req.body;

    const restaurant = await Restaurant.findById(req.user.id);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    restaurant.restaurantName = restaurantName || restaurant.restaurantName;
    restaurant.city = city || restaurant.city;
    restaurant.fssai = fssai || restaurant.fssai;
    restaurant.category = category || restaurant.category;

    await restaurant.save();

    res.json({ message: "Restaurant details updated successfully", restaurant });
  } catch (err) {
    console.error("Error updating restaurant:", err);
    res.status(500).json({ message: "Failed to update restaurant" });
  }
};


const updateRestaurantImages = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.user.id);

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Check if logo image was uploaded
    if (req.files['logoImage']) {
      restaurant.logoImage = `http://localhost:5000/uploads/menu_images/${req.files['logoImage'][0].filename}`;
    }

    // Check if cover image was uploaded
    if (req.files['coverImage']) {
      restaurant.coverImage = `http://localhost:5000/uploads/menu_images/${req.files['coverImage'][0].filename}`;
    }

    await restaurant.save();

    res.json({ message: 'Images updated successfully', restaurant });
  } catch (error) {
    console.error('Error updating images:', error);
    res.status(500).json({ message: 'Server error while updating images' });
  }
};


const status = async (req, res) => {
  try {
    const { isOnline } = req.body;
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { isOnline },
      { new: true }
    );

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Emit correct event
    const io = socketio.getIO();
    io.emit('restaurantStatusUpdate', {
      restaurantId: restaurant._id.toString(),
      isOnline: restaurant.isOnline,
    });

    res.json({ success: true, status: restaurant.isOnline });
  } catch (error) {
    console.error("Error updating restaurant status:", error);
    res.status(500).json({ message: 'Server error while updating status' });
  }
};

const nodemailer = require('nodemailer');



const sendForgotPasswordOtp = async (req, res) => {
  const { ownerEmail1 } = req.body;

  if (!ownerEmail1)
    return res.status(400).json({ message: "Email is required" });

  try {
    const restaurant = await Restaurant.findOne({ ownerEmail1 });

    if (!restaurant)
      return res.status(404).json({ message: "No restaurant found with this email" });

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    restaurant.otp = otp;
    restaurant.otp_expiry = expiry;
    await restaurant.save();

    // Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,      
        pass: process.env.GMAIL_APP_PASS    
      }
    });

    await transporter.sendMail({
      from: '"Delivo Eats" <no-reply@delivoeats.com>',
      to: ownerEmail1,
      subject: 'Delivo Eats - OTP for Password Reset',
      text: `Hello ${restaurant.ownerName || ''},

Your OTP for resetting your password is: ${otp}

This OTP is valid for 2 minutes.

Regards,
Delivo Eats Team`
    });

    res.json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("Error sending forgot password OTP:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};


const verifyForgotPasswordOtp = async (req, res) => {
  const { ownerEmail1, otp } = req.body;
  if (!ownerEmail1 || !otp) return res.status(400).json({ message: "Email and OTP are required" });

  try {
    const restaurant = await Restaurant.findOne({ ownerEmail1, otp });
    if (!restaurant) return res.status(400).json({ message: "Invalid OTP or email" });
    if (restaurant.otp_expiry < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    restaurant.otp_verified = true;
    await restaurant.save();

    res.json({ message: "OTP verified" });
  } catch (error) {
    console.error("Error verifying forgot password OTP:", error);
    res.status(500).json({ message: "OTP verification failed" });
  }
};

const changePassword = async (req, res) => {
  const { ownerEmail1, newPassword } = req.body;
  if (!ownerEmail1 || !newPassword) return res.status(400).json({ message: "Email and new password are required" });

  try {
    const restaurant = await Restaurant.findOne({ ownerEmail1 });
    if (!restaurant) return res.status(404).json({ message: "No restaurant found with this email" });

    if (!restaurant.otp_verified) {
      return res.status(403).json({ message: "OTP not verified, cannot change password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    restaurant.password = hashedPassword;

    restaurant.otp = null;
    restaurant.otp_expiry = null;
    restaurant.otp_verified = false;

    await restaurant.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Failed to change password" });
  }
};

module.exports = {
  getAcceptedRestaurants,
  registerRestaurant,
  loginWithEmail,
  sendOtp,
  verifyOtp,
  getProfile,
  me,
  getRestaurantId,
  updateProfile,
  updateRestaurant,
  updateRestaurantImages,
  status,
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  changePassword
};
