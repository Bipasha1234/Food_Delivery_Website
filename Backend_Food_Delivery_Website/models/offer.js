const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  value: { type: String, required: true },
  code: { type: String, required: true },
  desc: { type: String, required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  offerImage: { type: String, default: "" } 
}, { timestamps: true });

module.exports = mongoose.model('Offer', offerSchema);
