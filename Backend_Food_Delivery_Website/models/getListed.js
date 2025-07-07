const mongoose = require('mongoose');

const getListedSchema = new mongoose.Schema({
  ownerName: { type: String, required: true },
  restaurantName: { type: String, required: true },
  ownerEmail: { type: String, required: true },
  phone1: { type: String, required: true },
  details: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('GetListedRequest', getListedSchema);
