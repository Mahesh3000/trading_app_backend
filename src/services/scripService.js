// /services/scripService.js
const pool = require("../config/db");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const axios = require("axios");
const { redisClient } = require("../config/redis");
const { getUserProfile } = require("./userService");
require("dotenv").config(); // Ensure this is at the very top

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

// async function searchJSON(query) {
//   try {
//     const jsonData = JSON.parse(await redisClient.get("jsonData"));

//     // Case-insensitive search
//     return jsonData.filter(
//       (item) =>
//         item.name?.toLowerCase().includes(query.toLowerCase()) ||
//         item.symbol?.toLowerCase().includes(query.toLowerCase())
//     );
//   } catch (err) {
//     console.error("Error searching JSON:", err);
//     return [];
//   }
// }

async function searchJSON(query) {
  try {
    // Make a GET request to the API with the search query
    const response = await axios.get(
      `${process.env.SEARCH_API_GATEWAY}/coins`,
      {
        params: {
          search: query,
        },
      }
    );

    const jsonData = response.data;
    // console.log("jsonData", jsonData);

    if (!jsonData || jsonData.length === 0) {
      return [];
    }

    // Return filtered data based on the search query (case-insensitive)
    // return jsonData.filter(
    //   (item) =>
    //     item.name?.toLowerCase().includes(query.toLowerCase()) ||
    //     item.symbol?.toLowerCase().includes(query.toLowerCase())
    // );

    return jsonData;
  } catch (err) {
    // Log any errors that occur during the request
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

// const createTrade = async (
//   coin_id,
//   user_id,
//   trade_type,
//   quantity,
//   price_usd
// ) => {
//   try {
//     // Validate required fields
//     if (!coin_id || !user_id || !trade_type || !quantity || !price_usd) {
//       throw new Error("Missing required fields");
//     }

//     // Validate numeric values
//     if (isNaN(quantity) || quantity <= 0) {
//       throw new Error("Invalid quantity");
//     }
//     if (isNaN(price_usd) || price_usd <= 0) {
//       throw new Error("Invalid price");
//     }

//     // Calculate total value
//     const total_value_usd = quantity * price_usd;

//     // Insert trade into database
//     const query = `
//       INSERT INTO trades (coin_id, user_id, trade_type, quantity, price_usd, total_value_usd)
//       VALUES ($1, $2, $3, $4, $5, $6)
//       RETURNING *;
//     `;

//     const values = [
//       coin_id,
//       user_id,
//       trade_type,
//       quantity,
//       price_usd,
//       total_value_usd,
//     ];
//     console.log("values", values);

//     const result = await pool.query(query, values);

//     return result.rows[0];
//   } catch (error) {
//     console.error("Error creating trade:", error.message);
//     throw new Error("Failed to create trade");
//   }
// };

const createTrade = async (
  coin_id,
  user_id,
  trade_type,
  quantity,
  price_usd,
  coin_symbol
) => {
  try {
    // Validate required fields

    const profile = await getUserProfile(user_id);

    // Validate numeric values
    if (isNaN(quantity) || quantity <= 0) {
      throw new Error("Invalid quantity");
    }
    if (isNaN(price_usd) || price_usd <= 0) {
      throw new Error("Invalid price");
    }

    const availableBalance = profile.available_balance; // Get the available balance

    // Calculate total value
    const total_value_usd = quantity * price_usd;

    if (total_value_usd > availableBalance) {
      throw new Error(
        `Insufficient funds. Available balance: ${availableBalance}`
      );
    }

    if (trade_type === "buy") {
      const updatedBalance = availableBalance - total_value_usd;

      // Update the user's profile with the new balance
      await updateUserBalance(user_id, updatedBalance);
    }

    // Add the trade amount to available balance for "sell" trade
    if (trade_type === "sell") {
      const updatedBalance = availableBalance + total_value_usd;

      // Update the user's profile with the new balance
      await updateUserBalance(user_id, updatedBalance);
    }
    // Insert trade into database
    const query = `
      INSERT INTO trades (coin_id, user_id, trade_type, quantity, price_usd, total_value_usd,coin_symbol)
      VALUES ($1, $2, $3, $4, $5, $6,$7)
      RETURNING *;
    `;

    const values = [
      coin_id,
      user_id,
      trade_type,
      quantity,
      price_usd,
      total_value_usd,
      coin_symbol,
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
  } catch (error) {
    console.error("Error creating trade:", error.message);
    throw error;
  }
};

const updateUserBalance = async (user_id, updatedBalance) => {
  const query = `
    UPDATE users
    SET available_balance = $1
    WHERE id = $2
    RETURNING *;
  `;
  const values = [updatedBalance, user_id];

  const result = await pool.query(query, values);
  return result.rows[0]; // Return the updated profile
};

const getHoldingsService = async (userId) => {
  const query = `SELECT * FROM trades WHERE user_id = $1;`;

  try {
    const res = await pool.query(query, [userId]);
    return res.rows; // Return the watchlist items
  } catch (err) {
    logger.error("Error fetching holdings", err);
    throw new Error("Error fetching holdings");
  }
};

module.exports = {
  readCSV,
  searchCoins,
  getChartCoinData,
  getCoinDataFromCoinGecko,
  loadJSONToRedis,
  searchJSON,
  createTrade,
  getHoldingsService,
};
