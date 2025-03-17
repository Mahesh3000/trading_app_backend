// /services/scripService.js
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

// Function to read CSV and return the parsed data
const readCSV = () => {
  return new Promise((resolve, reject) => {
    const results = [];
    const filePath = path.join(__dirname, "..", "data", "scrips.csv"); // Adjust path to CSV file

    // Read and parse the CSV file
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => {
        resolve(results);
      })
      .on("error", (err) => {
        reject(err);
      });
  });
};

module.exports = {
  readCSV,
};
