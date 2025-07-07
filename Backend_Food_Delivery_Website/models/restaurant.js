const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  restaurantName: { type: String, required: true },

  city: { type: String },
  fssai: { type: String },
  category: { type: String },
  ownerName: { type: String},
  details: { type: String,required:true},
  phone: { type: String, unique: true },
   phone1: { type: String },
  phone2: { type: String },
  ownerEmail1: { type: String, unique: true, sparse: true },
  password: { type: String }, 
  otp: { type: String },
  otp_expiry: { type: Date },
  otp_verified: {
    type: Boolean,
    default: false,
  },

  logoImage: {
    type: String,
   
  },
  coverImage: {
    type: String,
    
  },
   isOnline: {
    type: Boolean,
    default: false, 
  }
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);
