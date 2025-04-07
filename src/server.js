const express = require("express");
const cors = require("cors");
const scripRoutes = require("./routes/scripRoutes");
const authRoutes = require("./routes/authRoutes");
const logger = require("./utils/logger"); // Import logger
const watchlistRoutes = require("./routes/watchlistRoutes");
const { connectRedis } = require("./config/redis");
const { loadJSONToRedis } = require("./services/scripService");

const app = express();
const PORT = process.env.PORT || 8000;

// Middlewares
const helmet = require("helmet");
app.use(cors({ origin: "https://main.d1dp07c5ddir1n.amplifyapp.com" }));

app.use(express.json());

// Routes
app.use("/api", scripRoutes);
app.use("/api/users", authRoutes);
app.use("/api/watchlist", watchlistRoutes); // Mount watchlist routes

// Connect to Redis
// connectRedis();

// Load JSON into Redis at startup
// loadJSONToRedis();

// Start server
app.get("/", (req, res) => {
  res.send(`TRADE SWIFT SERVICES IS RUNNING AT ${PORT}`);
});

// Log server start with Winston
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
