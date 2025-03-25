const pool = require("../config/db"); // Import the pool instance from your existing db.js
const logger = require("../utils/logger"); // Assuming you have a logger utility

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
    logger.info("Watchlist item added successfully", { newItem: res.rows[0] });
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

module.exports = {
  addToWatchlistService,
  getWatchlistService,
  removeFromWatchlist,
};
