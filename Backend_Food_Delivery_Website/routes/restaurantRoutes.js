const express = require('express');
const router = express.Router();
const {registerRestaurant,loginWithEmail,sendOtp, verifyOtp, getAcceptedRestaurants,getProfile,me ,
    getRestaurantId,updateProfile,updateRestaurant,updateRestaurantImages,
    status,
    sendForgotPasswordOtp,
    verifyForgotPasswordOtp,
    changePassword} = require('../controllers/restaurantController');

const authenticate = require("../middleware/auth");
const multer = require('multer');

router.get('/restaurants',getAcceptedRestaurants);
router.post('/register', registerRestaurant);
router.post('/login', loginWithEmail);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/menu_images/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

router.get("/profile", authenticate, getProfile);
router.put('/update-me', authenticate, updateProfile);
router.put('/update-restaurant',authenticate, updateRestaurant);

router.get("/me", authenticate, me);
router.get("/:id", getRestaurantId); ////yo matra change garya ho
router.put(
  '/update-images',
  authenticate,
  upload.fields([
    { name: 'logoImage', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
  ]),
  updateRestaurantImages
);

router.put('/status/:id', authenticate, status); 
router.post("/forgot-password/send-otp", sendForgotPasswordOtp);
router.post("/forgot-password/verify-otp", verifyForgotPasswordOtp);
router.post("/forgot-password/change-password", changePassword);

module.exports = router;
