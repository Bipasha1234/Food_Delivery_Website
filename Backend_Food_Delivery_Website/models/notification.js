const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
  },
  message: {
    type: String,
    required: true,
  },
  recipients: {
    type: [String], // e.g., ['customer', 'restaurant']
    required: true,
  },
  read: {
    type: Boolean,
    default: false,   // New notifications are unread by default
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


module.exports = mongoose.model('Notification', notificationSchema);
