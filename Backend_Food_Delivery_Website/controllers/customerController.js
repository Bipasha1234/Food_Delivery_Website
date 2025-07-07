const Customer = require('../models/customer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const order = require('../models/order');
const nodemailer = require('nodemailer');

const registerCustomer = async (req, res) => {
  const { fullName, email, mobile, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  const existing = await Customer.findOne({ email });
  if (existing) return res.status(400).json({ message: 'Email already exists' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const customer = new Customer({ fullName, email, mobile, password: hashedPassword });
  await customer.save();

  res.status(201).json({ message: 'Customer registered successfully' });
};



const loginCustomer = async (req, res) => {
  const { email, password } = req.body;

  const customer = await Customer.findOne({ email });
  if (!customer) return res.status(400).json({ message: 'Invalid email or password' });

  const isMatch = await bcrypt.compare(password, customer.password);
  if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

  const token = jwt.sign({ id: customer._id, role: 'customer' }, process.env.JWT_SECRET, { expiresIn: '7d' });

  res.json({
    token,
    user: {
      _id: customer._id,
      fullName: customer.fullName,
      email: customer.email
    }
  });
};



const getCustomerProfile = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id).select('-password');
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    res.json({
      id: customer._id,
      fullName: customer.fullName,
      email: customer.email,
      mobile: customer.mobile
    });
  } catch (err) {
    console.error('Error fetching customer profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


const updateCustomerProfile = async (req, res) => {
  try {
    const { fullName, mobile, email } = req.body;

    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.user.id,
      { fullName, mobile, email },
      { new: true }
    ).select('-password');

    res.json({ message: 'Profile updated successfully', customer: updatedCustomer });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
const addFavorites = async (req, res) => {
  try {
    const { restaurantId } = req.body;

    const customer = await Customer.findById(req.user.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    if (customer.favorites.includes(restaurantId)) {
      return res.status(400).json({ message: 'Restaurant already in favorites' });
    }

    customer.favorites.push(restaurantId);
    await customer.save();

    res.json({ message: 'Restaurant added to favorites' });
  } catch (error) {
    console.error('Add Favorites Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



const removeFavorites = async (req, res) => {
  try {
    const { restaurantId } = req.body;

    const customer = await Customer.findById(req.user.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    customer.favorites = customer.favorites.filter(id => id.toString() !== restaurantId);
    await customer.save();

    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    console.error('Remove Favorites Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


const getFavorites = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id).populate('favorites');
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    res.json(customer.favorites);
  } catch (error) {
    console.error('Fetch Favorites Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().select('-password'); 
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


const getCustomerStats = async (req, res) => {
  try {
    // Total customers
    const totalCustomers = await Customer.countDocuments();

    // Define date ranges for growth calculation
    const now = new Date();

    // Current month start and end
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Previous month start and end
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Count customers created in current month
    const currentMonthCount = await Customer.countDocuments({
      createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd },
    });

    // Count customers created in previous month
    const prevMonthCount = await Customer.countDocuments({
      createdAt: { $gte: prevMonthStart, $lte: prevMonthEnd },
    });

    // Calculate growth percentage
    let customerGrowth = 0;
    if (prevMonthCount > 0) {
      customerGrowth = ((currentMonthCount - prevMonthCount) / prevMonthCount) * 100;
    } else if (currentMonthCount > 0) {
      customerGrowth = 100; // If no customers last month but some this month
    }

    // Round growth to 2 decimal places
    customerGrowth = Math.round(customerGrowth * 100) / 100;

    res.json({
      totalCustomers,
      customerGrowth,
    });
  } catch (error) {
    console.error('Error fetching customer stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const customer = await Customer.findOne({ email });
  if (!customer) return res.status(404).json({ error: 'Customer not found with that email.' });

  const token = jwt.sign({ id: customer._id }, process.env.JWT_SECRET, { expiresIn: '10m' });

  const resetLink = `http://localhost:5173/change-password/${token}`;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,       
      pass: process.env.GMAIL_APP_PASS
    }
  });

  try {
    await transporter.sendMail({
      from: '"Delivo Eats" <no-reply@delivoeats.com>',
      to: email,
      subject: 'Reset Password',
      html: `<p>Click the link below to reset your password:</p><a href="${resetLink}">${resetLink}</a>`
    });

    res.json({ message: 'Reset password link sent to your email.' });
  } catch (err) {
    console.error('Email error:', err);
    res.status(500).json({ error: 'Failed to send email. Try again later.' });
  }
};




const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  console.log('Received token:', token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const customerId = decoded.id;

    const hashedPassword = await bcrypt.hash(password, 10);

    await Customer.findByIdAndUpdate(customerId, { password: hashedPassword });

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(400).json({ message: 'Invalid or expired token' });
  }
};


module.exports = {
  registerCustomer,
  loginCustomer,
  getCustomerProfile,
  updateCustomerProfile,
  addFavorites,
  removeFavorites,
  getFavorites, 
  getAllCustomers,
  getCustomerStats,
  forgotPassword,
  resetPassword
};