const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  type: String,
  price: {
    type: Number,
    required: true,
  },
  shortDescription: String,
  longDescription: String,

  offer: String,
  preparationTime: String,
  image: String,
  status: {
    type: String,
    enum: ["Available", "Not Available"],
    default: "Available",
  },
}, { timestamps: true });

module.exports = mongoose.model("Menu", menuSchema);
