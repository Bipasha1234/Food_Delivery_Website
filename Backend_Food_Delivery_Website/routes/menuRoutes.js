const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  addMenuItem,
  getMenuItems,
  getSingleMenuItem,
  updateMenuItem,
  toggleMenuStatus,
  deleteMenuItem,
  getByRes,
} = require("../controllers/menuController");
const verifyToken = require("../middleware/auth");

// Setup multer for image uploads
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
router.post("/add", verifyToken, upload.single("image"), addMenuItem);
router.get("/add", verifyToken, getMenuItems); // same as fetch all
router.get("/:id", verifyToken, getSingleMenuItem);
router.patch("/:id", verifyToken, updateMenuItem);
router.patch("/:id/status", verifyToken, toggleMenuStatus);
router.delete("/:id", verifyToken, deleteMenuItem);
router.get("/by-restaurant/:restaurantId",getByRes);

module.exports = router;
