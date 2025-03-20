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

pool.on("connect", () => {
  logger.info("Connected to the database successfully");
});

pool.on("error", (err) => {
  logger.error("Database connection error", err);
  process.exit(-1); // Exit the process if the connection fails
});

module.exports = pool;
