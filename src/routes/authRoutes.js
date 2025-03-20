const express = require("express");

const authControllers = require("../controllers/authControllers");

const router = express.Router();

router.post("/signup", authControllers.registerUser);
router.post("/login", authControllers.loginUser);
router.get("/profile", authControllers.getUserProfile);
router.post("/add-funds", authControllers.addFunds);

module.exports = router;
