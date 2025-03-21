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

const getCoinData = async (req, res) => {
  const coinId = req.params?.id; // Extract coin ID from the URL params
  const days = req.query.days;
  console.log("coinId", coinId, days);

  try {
    const coinData = await scripService.getCoinDataFromCoinGecko(coinId, days);
    res.status(200).json(coinData); // Send coin data back to the client
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: error.message || "Error fetching coin data" });
  }
};

module.exports = {
  getScrips,
  searchCoins,
  getCoinData,
};
