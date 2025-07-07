const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
  },
  lat: {
    type: Number,
    required: true,
  },
  lon: {
    type: Number,
    required: true,
  },
  userId: {                         
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: false,
  },
}, { timestamps: true });

module.exports = mongoose.model("Location", locationSchema);
