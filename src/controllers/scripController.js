// /controllers/scripController.js
const scripService = require("../services/scripService");

// Controller function to get scrips data
const getScrips = async (req, res) => {
  try {
    const scrips = await scripService.readCSV();
    res.json(scrips);
  } catch (error) {
    res.status(500).json({ message: "Error reading CSV file", error });
  }
};

module.exports = {
  getScrips,
};
