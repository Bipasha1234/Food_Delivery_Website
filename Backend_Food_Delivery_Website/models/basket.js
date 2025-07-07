const mongoose = require('mongoose');

const basketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
   restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  items: [
    {
      _id: String,
      name: String,
      price: Number,
      quantity: Number,
      shortDescription: String,
       note: { type: String, default: '' },
    }
  ],
  offerPercentage: { type: Number }, 
   offerDeduction:{type: Number},
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model('Basket', basketSchema);