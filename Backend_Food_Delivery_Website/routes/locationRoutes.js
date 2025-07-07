const express = require("express");
const router = express.Router();
const {saveLocation,getLocation} = require("../controllers/locationController");
const  verifyToken  =require( "../middleware/auth");
router.post("/location", verifyToken, saveLocation);
router.get("/location", verifyToken,getLocation);

module.exports = router;
