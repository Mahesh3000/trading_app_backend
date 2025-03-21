const express = require("express");
const {
  addToWatchlistController,
  getWatchlist,
} = require("../controllers/watchlistController");
const router = express.Router();

// Route for adding to watchlist
router.post("/add-to-watchlist", addToWatchlistController);
router.get("/:userId", getWatchlist);

module.exports = router;
