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
const corsOptions = {
  origin: "http://maheshsivangi.tech:5173", // Replace with your actual frontend URL
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Allow cookies/auth headers
};
app.use(cors(corsOptions));
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
// app.listen(PORT, () => {
//   logger.info(`Server is running on port ${PORT}`);
// });

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
