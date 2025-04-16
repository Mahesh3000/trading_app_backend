const pool = require("../config/db");
const logger = require("../utils/logger");
const axios = require("axios");

const COIN_GECKO_API_KEY = process.env.COIN_GECKO_API_KEY; // You can set it in a .env file
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API;

const addToWatchlistService = async (userId, symbol, companyName, coinId) => {
  const checkQuery = `SELECT id FROM watchlist WHERE symbol = $1 AND user_id = $2;`;
  const insertQuery = `
      INSERT INTO watchlist (symbol, company_name, user_id,coin_id)
      VALUES ($1, $2, $3,$4)
      RETURNING id, symbol, created_at;
    `;

  try {
    // Check if the symbol already exists
    const existing = await pool.query(checkQuery, [symbol, userId]);

    if (existing.rows.length > 0) {
      return { message: "Symbol already exists in watchlist" }; // Prevent duplicate entry
    }

    // Insert new entry if not found
    const res = await pool.query(insertQuery, [
      symbol,
      companyName,
      userId,
      coinId,
    ]);
    return res.rows[0];
  } catch (err) {
    logger.error("Error adding to watchlist", err);
    throw new Error("Error adding to watchlist");
  }
};

const getWatchlistService = async (userId) => {
  const query = `SELECT * FROM watchlist WHERE user_id = $1;`;

  try {
    const res = await pool.query(query, [userId]);
    return res.rows; // Return the watchlist items
  } catch (err) {
    logger.error("Error fetching watchlist", err);
    throw new Error("Error fetching watchlist");
  }
};

const removeFromWatchlist = async (userId, coinId) => {
  try {
    // Query to delete the coin from the watchlist
    const query = "DELETE FROM watchlist WHERE user_id = $1 AND coin_id = $2";
    const result = await pool.query(query, [userId, coinId]);

    if (result.rowCount === 0) {
      return { success: false, message: "Coin not found in watchlist" };
    }

    return { success: true, message: "Successfully removed from watchlist" };
  } catch (error) {
    logger.error("Error deleting from watchlist:", error);
    throw new Error("Server error");
  }
};

// from coin gecko api commeted to use coin market api as it has 30 apis per minute
// const getCoinPriceFromCoinGecko = async (coinId) => {
//   try {
//     const response = await axios.get(
//       `https://api.coingecko.com/api/v3/simple/price`,
//       {
//         params: {
//           ids: coinId,
//           vs_currencies: "usd",
//           include_24hr_change: true, // Fetch 24-hour change percentage
//         },
//         headers: {
//           Authorization: `Bearer ${COIN_GECKO_API_KEY}`,
//         },
//       }
//     );

//     return {
//       current_price: response.data[coinId]?.usd || null,
//       change_percent: response.data[coinId]?.usd_24h_change || null,
//     };
//   } catch (error) {
//     console.error(`Error fetching price for ${coinId}:`, error);
//     return { current_price: null, change_percent: null }; // Return nulls in case of an error
//   }
// };

const getCoinPriceFromCoinGecko = async (coinId) => {
  try {
    const response = await axios.get(
      `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest`,
      {
        params: {
          symbol: coinId,
        },
        headers: {
          "X-CMC_PRO_API_KEY": `${COINMARKETCAP_API_KEY}`,
        },
      }
    );

    return {
      current_price: response.data.data[coinId].quote.USD.price || null,
      change_percent:
        response.data.data[coinId].quote.USD.percent_change_24h || null,
    };
  } catch (error) {
    console.error(`Error fetching price for ${coinId}:`, error);
    return { current_price: null, change_percent: null }; // Return nulls in case of an error
  }
};

module.exports = {
  addToWatchlistService,
  getWatchlistService,
  removeFromWatchlist,
  getCoinPriceFromCoinGecko,
};
