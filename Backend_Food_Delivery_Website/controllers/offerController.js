const Offer = require('../models/offer');
const mongoose = require('mongoose');


exports.getOffers = async (req, res) => {
  try {
    const offers = await Offer.find().sort({ createdAt: -1 });
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
exports.getOfferById = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ message: 'Invalid restaurant ID' });
    }

    const offers = await Offer.find({ restaurantId });

    res.json(offers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};


exports.addOffer = async (req, res) => {
  try {
    const { title, value, code, desc, restaurantId } = req.body;

    if (!title || !value || !code || !desc || !restaurantId) {
      return res.status(400).json({ message: 'All fields including restaurantId are required' });
    }
      const offerImage = req.file?.filename;

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ message: 'Invalid restaurantId' });
    }

    const newOffer = new Offer({ title, value, code, desc, restaurantId,offerImage });
    const savedOffer = await newOffer.save();

    res.status(201).json(savedOffer);
  } catch (error) {
    console.error('Error adding offer:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Offer.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    res.json({ message: 'Offer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
