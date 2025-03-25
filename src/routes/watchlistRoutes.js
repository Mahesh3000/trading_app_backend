const express = require("express");
const {
  addToWatchlistController,
  getWatchlist,
  deleteFromWatchlist,
} = require("../controllers/watchlistController");
const router = express.Router();

// Route for adding to watchlist
router.post("/add-to-watchlist", addToWatchlistController);
router.get("/:userId", getWatchlist);
router.delete("/remove", deleteFromWatchlist);

module.exports = router;
