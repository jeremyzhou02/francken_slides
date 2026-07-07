// routes/auth.js
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const protect = require("./authMiddleware");

/**
 * @route   POST /api/auth/login
 * @desc    Verify admin credentials against environment variables
 * @access  Public, visble to everyone.
 */

router.post("/login", (req, res) => {
  const { password } = req.body;

  // Check if details entered
  if (!password) {
    return res.status(400).json({
      success: false,
      message: "Authentication failed. Missing passphrase, Try again.",
    });
  }

  // Check login-details
  if (password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ isAdmin: true }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });
    return res.json({
      success: true,
      message: "Login successful",
      token: token,
    });
  }

  // credentials do not match
  return res
    .status(401)
    .json({ success: false, message: "Authentication failed. Try again." });
});

// ============================================================================= //

/**
 * @route   GET /api/auth/login
 * @desc    Check if token is correct.
 * @access  Public, visble to everyone.
 */

router.get("/login", protect, (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Session authenticated successfully.",
  });
});

module.exports = router;
