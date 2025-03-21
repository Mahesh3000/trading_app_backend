const {
  addToWatchlistService,
  getWatchlistService,
} = require("../services/watchlistService");

const addToWatchlistController = async (req, res) => {
  const { userId, symbol, companyName } = req.body;

  if (!userId || !symbol || !companyName) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const newWatchlistItem = await addToWatchlistService(
      userId,
      symbol,
      companyName
    );
    res.status(201).json({
      message: "Item added to watchlist",
      watchlistItem: newWatchlistItem,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getWatchlist = async (req, res) => {
  const { userId } = req.params;

  console.log("userId", userId);

  try {
    const watchlist = await getWatchlistService(userId);
    res.json({ watchlist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getWatchlist };

module.exports = {
  addToWatchlistController,
  getWatchlist,
};
