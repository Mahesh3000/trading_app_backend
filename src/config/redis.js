const { createClient } = require("redis");

// Redis client with explicit host and port (IPv4 address)
const redisClient = createClient({
  url: "redis://127.0.0.1:6379", // Use IPv4 address explicitly
});

redisClient.on("error", (err) => console.error("Redis Error:", err));

async function connectRedis() {
  try {
    await redisClient.connect();
    console.log("Connected to Redis");
  } catch (err) {
    console.error("Redis connection error:", err);
  }
}

module.exports = { redisClient, connectRedis };
