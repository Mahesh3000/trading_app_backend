// /services/scripService.js
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const axios = require("axios");
const { redisClient } = require("../config/redis");

async function loadJSONToRedis() {
  try {
    // Use path.join to build the file path dynamically
    const filePath = path.join(__dirname, "..", "data", "coins_list.json");
    const jsonData = fs.readFileSync(filePath, "utf-8");

    // Store the JSON data in Redis
    await redisClient.set("jsonData", jsonData);
    console.log("JSON data loaded into Redis");
  } catch (err) {
    console.error("Error loading JSON into Redis:", err);
  }
}

async function searchJSON(query) {
  try {
    const jsonData = JSON.parse(await redisClient.get("jsonData"));

    // Case-insensitive search
    return jsonData.filter(
      (item) =>
        item.name?.toLowerCase().includes(query.toLowerCase()) ||
        item.symbol?.toLowerCase().includes(query.toLowerCase())
    );
  } catch (err) {
    console.error("Error searching JSON:", err);
    return [];
  }
}

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

const getChartCoinData = async (coinId, days) => {
  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
    );

    return response.data;
  } catch (error) {
    throw new Error("Error fetching data from CoinGecko");
  }
};

const getCoinDataFromCoinGecko = async (coinId) => {
  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${coinId}`
    );
    return response.data;
  } catch (error) {
    throw new Error("Error fetching data from CoinGecko");
  }
};

module.exports = {
  readCSV,
  searchCoins,
  getChartCoinData,
  getCoinDataFromCoinGecko,
  loadJSONToRedis,
  searchJSON,
};
