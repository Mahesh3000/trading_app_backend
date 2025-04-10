const {
  addToWatchlistService,
  getWatchlistService,
  removeFromWatchlist,
  getCoinPriceFromCoinGecko,
} = require("../services/watchlistService");

const addToWatchlistController = async (req, res) => {
  const { userId, symbol, companyName, coinId } = req.body;

  if (!userId || !symbol || !companyName) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const newWatchlistItem = await addToWatchlistService(
      userId,
      symbol,
      companyName,
      coinId
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

  try {
    const watchlist = await getWatchlistService(userId);

    const updatedWatchlist = await Promise.all(
      watchlist.map(async (item) => {
        const { current_price, change_percent } =
          await getCoinPriceFromCoinGecko(item.symbol.toUpperCase());
        return {
          ...item,
          current_price,
          change_percent,
        };
      })
    );

    res.json({ updatedWatchlist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteFromWatchlist = async (req, res) => {
  const { userId, coinId } = req.body;

  if (!userId || !coinId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const result = await removeFromWatchlist(userId, coinId);

    if (result.success) {
      return res.status(200).json({ message: result.message });
    } else {
      return res.status(404).json({ message: result.message });
    }
  } catch (error) {
    console.error("Error in deleteFromWatchlist controller:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  addToWatchlistController,
  getWatchlist,
  deleteFromWatchlist,
};
