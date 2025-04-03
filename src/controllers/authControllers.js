const userService = require("../services/userService");

exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = await userService.registerUser(username, email, password);
    return res.status(201).json(user);
  } catch (error) {
    if (error.message === "Email is already registered") {
      return res.status(400).json({ error: error.message });
    }

    res
      .status(500)
      .json({ error: "User registration failed. Please try again later." });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Call the service to handle login logic
    const user = await userService.loginUser(email, password);

    // If no user found or password doesn't match, return a 401 error
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // If login is successful, send the user data along with the JWT token
    res.status(200).json({
      message: "Login successful",
      user: user.user,
      token: user.token,
    });
  } catch (error) {
    console.error("Login failed:", error);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    // Extract userId from query params
    const { userId } = req.query;

    // Validate userId
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Fetch user profile from the service
    const user = await userService.getUserProfile(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: error.message || "Fetching profile failed" });
  }
};

exports.addFunds = async (req, res) => {
  try {
    const { userId, amount } = req.body;

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid user ID or amount" });
    }

    // Call the service method to add funds
    const response = await userService.addFunds(userId, amount);

    // Return the success message and the updated balance (or user data)
    res.status(200).json(response);
  } catch (error) {
    console.error("Error in addFunds controller:", error);
    res.status(500).json({ error: error.message || "Failed to add funds" });
  }
};
