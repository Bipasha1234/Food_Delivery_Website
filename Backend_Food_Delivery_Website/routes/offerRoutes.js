const express = require('express');
const { getOffers, addOffer, deleteOffer, getOfferById } = require('../controllers/offerController');
const authenticate = require('../middleware/auth');
const multer = require('multer');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/menu_images/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});


const upload = multer({ storage });
// Routes
router.get('/', getOffers);         // Get all offers
router.post('/', authenticate, upload.single("offerImage"),addOffer);         // Add new offer
router.delete('/:id',authenticate, deleteOffer); // Delete an offer by ID
router.get('/:restaurantId', getOfferById); 

module.exports = router;
