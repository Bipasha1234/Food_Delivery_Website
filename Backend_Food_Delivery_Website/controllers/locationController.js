const Location = require("../models/locationModel");

//to save location this code is here-
const saveLocation = async (req, res) => {
  try {
    const userId = req.user.id; 
    const { address, lat, lon} = req.body;
    if (!address || lat === undefined || lon === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const location = await Location.findOneAndUpdate(
      { userId },
      { address, lat, lon },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ message: "Location saved", location });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};


const getLocation = async (req, res) => {
  try {
    const userId = req.user.id; 
    const location = await Location.findOne({ userId });
    if (!location) {
      return res.status(404).json({ error: "Location not found" });
    }
    res.json(location);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
module.exports = {
  saveLocation,
  getLocation,
};
