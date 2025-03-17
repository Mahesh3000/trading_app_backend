// /routes/scripRoutes.js
const express = require("express");
const router = express.Router();
const scripController = require("../controllers/scripController");

// Define the route to get scrips
router.get("/scrips", scripController.getScrips);

module.exports = router;
