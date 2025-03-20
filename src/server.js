const express = require("express");
const cors = require("cors");
const scripRoutes = require("./routes/scripRoutes");
const authRoutes = require("./routes/authRoutes");
const logger = require("./utils/logger"); // Import logger

const app = express();
const PORT = process.env.PORT || 8000;

// Middlewares
const helmet = require("helmet");
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", scripRoutes);
app.use("/api/users", authRoutes);

// Start server
app.get("/", (req, res) => {
  res.send(`TRADE SWIFT SERVICES IS RUNNING AT ${PORT}`);
});

// Log server start with Winston
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
