// /routes/scripRoutes.js
const express = require("express");
const router = express.Router();
const {
  searchCoins,
  getCoinChartData,
  getCoinData,
  searchHandler,
} = require("../controllers/scripController"); // Import the controller function

// Define the route to get scrips
// router.get("/scrips", scripController.getScrips);

router.get("/search", searchHandler);
router.get("/coin/:id/chart", getCoinChartData);
router.get("/coin/:id", getCoinData);

module.exports = router;
