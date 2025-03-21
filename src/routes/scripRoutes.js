// /routes/scripRoutes.js
const express = require("express");
const router = express.Router();
const { searchCoins, getCoinData } = require("../controllers/scripController"); // Import the controller function

// Define the route to get scrips
// router.get("/scrips", scripController.getScrips);

router.get("/search", searchCoins);
router.get("/coin/:id/chart", getCoinData);

module.exports = router;
