const { Pool } = require("pg");
const logger = require("../utils/logger");
const dotenv = require("dotenv");
// import dotenv from "dotenv";

dotenv.config();
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

(async () => {
  try {
    const client = await pool.connect();
    logger.info("Connected to the database successfully");
    client.release(); // release back to pool
  } catch (err) {
    logger.error("Failed to connect to the database:", err);
    process.exit(1);
  }
})();

// Handle pool-level errors (rare, but good to have)
pool.on("error", (err) => {
  logger.error("Unexpected database error", err);
  process.exit(-1); // crash app on unrecoverable DB error
});

module.exports = pool;
