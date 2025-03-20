const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");
require("dotenv").config(); // Ensure this is at the very top

exports.registerUser = async (username, email, password) => {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if the user already exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new Error("Email is already registered");
    }

    // Insert the new user into the database
    const result = await pool.query(
      "INSERT INTO users (username, email, password_hash, available_balance) VALUES ($1, $2, $3, $4) RETURNING id, username, email",
      [username, email, hashedPassword, 10000] // Set initial available_balance to 10000
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h", // Token expires in 1 hour
    });

    // Log the successful registration
    logger.info(`User registered with ID: ${user.id}`);

    // Return token and user data
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    };
  } catch (error) {
    console.error("Error registering user:", error.message);
    logger.error(`User registration failed: ${error.message}`);

    if (error.message === "Email is already registered") {
      throw new Error(
        "Email is already registered. Please use a different email."
      );
    }

    throw new Error("User registration failed. Please try again later.");
  }
};

exports.loginUser = async (email, password) => {
  try {
    // Query the database to find the user by email
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    // If no user found with that email, return null
    if (result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return null;
    }

    // If the password matches, generate a JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h", // Token expires in 1 hour
    });

    // Return the user data and JWT token
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    };
  } catch (error) {
    console.error("Error in login service:", error);
    throw new Error("Internal server error");
  }
};

exports.getUserProfile = async (userId) => {
  // Query to fetch user profile from database
  const user = await pool.query(
    "SELECT id, username, email, available_balance FROM users WHERE id = $1",
    [userId]
  );

  // Return user data or null if no user found
  return user.rows[0] || null;
};

exports.addFunds = async (userId, amount) => {
  if (amount <= 0) {
    throw new Error("Invalid amount");
  }

  // Check if user exists
  const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [
    userId,
  ]);
  if (userResult.rows.length === 0) {
    throw new Error("User not found");
  }

  // Update available balance
  const updateResult = await pool.query(
    "UPDATE users SET available_balance = available_balance + $1 WHERE id = $2 RETURNING id, username, email, available_balance",
    [amount, userId]
  );

  // Return updated user data or success message
  return {
    message: "Funds added successfully",
    user: updateResult.rows[0], // Return the updated user data
  };
};
