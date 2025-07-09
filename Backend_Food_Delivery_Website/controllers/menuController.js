const Menu = require("../models/menuModel");
const mongoose = require("mongoose");

//to add menu,delete,edit,get menu by restaurant id added
const addMenuItem = async (req, res) => {
  try {
    const {
      name,
      type,
      price,
      shortDescription,
      longDescription,
    
      offer,
      preparationTime,
      status,
    } = req.body;

    const image = req.file?.filename;
    const restaurantId = req.user.id;

    const menuItem = await Menu.create({
      restaurant: restaurantId,
      name,
      type,
      price,
      shortDescription,
      longDescription,
      
      offer,
      preparationTime,
      image,
      status: status || "Available",
    });

    res.status(201).json(menuItem);
  } catch (err) {
    res.status(500).json({ error: "Failed to add menu item", message: err.message });
  }
};

// GET: Fetch all menu items of logged-in restaurant
const getMenuItems = async (req, res) => {
  try {
    const restaurantId = req.user.id;
    const items = await Menu.find({ restaurant: restaurantId });
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch menu items", message: err.message });
  }
};


// GET: Fetch single menu item by ID
const getSingleMenuItem = async (req, res) => {
  try {
    const menuItem = await Menu.findById(req.params.id);
    if (!menuItem) return res.status(404).json({ error: "Menu not found" });
    res.json(menuItem);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch menu", message: err.message });
  }
};

const getByRes = async (req, res) => {
  try {
    const restaurantId = new mongoose.Types.ObjectId(req.params.restaurantId); // convert string to ObjectId
    const menuItems = await Menu.find({ restaurant: restaurantId });

    if (!menuItems || menuItems.length === 0) {
      return res.status(404).json({ error: 'Menu not found' });
    }

    res.json(menuItems);
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
};

const updateMenuItem = async (req, res) => {
  try {
    const updated = await Menu.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update menu item", message: err.message });
  }
};

const toggleMenuStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Menu.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update status", message: err.message });
  }
};

const deleteMenuItem = async (req, res) => {
  try {
    await Menu.findByIdAndDelete(req.params.id);
    res.json({ message: "Menu deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete menu", message: err.message });
  }
};

module.exports = {
  addMenuItem,
  getMenuItems,
  getSingleMenuItem,
  updateMenuItem,
  toggleMenuStatus,
  deleteMenuItem,
  getByRes
};
