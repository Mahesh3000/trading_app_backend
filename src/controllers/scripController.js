// /controllers/scripController.js
const scripService = require("../services/scripService");
// const coinService = require("../services/scripService"); // Import the coinService

// Controller function to get scrips data
const getScrips = async (req, res) => {
  try {
    const scrips = await scripService.readCSV();
    res.json(scrips);
  } catch (error) {
    res.status(500).json({ message: "Error reading CSV file", error });
  }
};

// Controller for the search route
const searchCoins = async (req, res) => {
  const searchTerm = req.query.term; // Extract search term from query

  if (!searchTerm) {
    return res.status(400).json({ error: "Search term is required" });
  }

  try {
    const filteredCoins = await scripService.searchCoins(searchTerm); // Call the service to filter coins
    res.json(filteredCoins); // Return filtered coins
    console.log("in try");
  } catch (error) {
    console.error("Error searching coins:", error);
    res.status(500).json({ error: "Failed to search coins" });
  }
};

const getCoinChartData = async (req, res) => {
  const coinId = req.params?.id; // Extract coin ID from the URL params
  const days = req.query.days;
  console.log("coinId", coinId, days);

  try {
    const coinData = await scripService.getChartCoinData(coinId, days);
    res.status(200).json(coinData); // Send coin data back to the client
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: error.message || "Error fetching coin data" });
  }
};

const getCoinData = async (req, res) => {
  const coinId = req.params.id; // Extract coin ID from the URL params

  try {
    const coinData = await scripService.getCoinDataFromCoinGecko(coinId);
    res.status(200).json(coinData); // Send coin data back to the client
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: error.message || "Error fetching coin data" });
  }
};

async function searchHandler(req, res) {
  const { query } = req.query;
  if (!query)
    return res.status(400).json({ error: "Query parameter is required" });

  const results = await scripService.searchJSON(query);
  res.json(results);
}

const createTradeController = async (req, res) => {
  const { coinId, userId, tradeType, quantity, priceUsd } = req.body;
  console.log("req.body", req.body);

  try {
    const trade = await scripService.createTrade(
      coinId,
      userId,
      tradeType,
      quantity,
      priceUsd
    );
    res.status(201).json(trade);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getHoldings = async (req, res) => {
  const { userId } = req.query;

  console.log("userId", req);

  try {
    const holdings = await scripService.getHoldingsService(userId);
    res.json({ holdings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
module.exports = {
  getScrips,
  searchCoins,
  getCoinChartData,
  getCoinData,
  searchHandler,
  createTradeController,
  getHoldings,
};
