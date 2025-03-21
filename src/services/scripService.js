// /services/scripService.js
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const axios = require("axios");

// Function to read CSV and return the parsed data
const readCSV = () => {
  return new Promise((resolve, reject) => {
    const results = [];
    const filePath = path.join(__dirname, "..", "data", "scrips.csv"); // Adjust path to CSV file

    // Read and parse the CSV file
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => {
        resolve(results);
      })
      .on("error", (err) => {
        reject(err);
      });
  });
};

// Service to fetch coins from CoinGecko and filter based on search term
const searchCoins = async (searchTerm) => {
  try {
    // Fetch coins data from CoinGecko
    const response = await axios.get(
      "https://api.coingecko.com/api/v3/coins/markets",
      {
        params: {
          vs_currency: "usd", // You can change the currency if needed
          order: "market_cap_desc", // Optional, to order by market cap
          per_page: 100, // Adjust the number of coins returned
          page: 1, // You can implement pagination if needed
          // api_key: "CG-yg9uMhSDHHD87HuJBE2LyJgm", // Add your API key here
        },
      }
    );

    // console.log("response", response);

    // Filter coins based on search term (matching on name or symbol)
    return response.data.filter(
      (coin) =>
        coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (error) {
    console.error(
      "Error fetching coins from CoinGecko:",
      error.message || error
    );
    throw new Error("Failed to fetch coins from CoinGecko");
  }
};

const getCoinDataFromCoinGecko = async (coinId, days) => {
  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
    );

    return response.data;
  } catch (error) {
    throw new Error("Error fetching data from CoinGecko");
  }
};

module.exports = {
  readCSV,
  searchCoins,
  getCoinDataFromCoinGecko,
};
