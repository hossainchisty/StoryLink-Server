// Basic Lib Imports
const express = require("express");
const router = express.Router();

const {
  createAccountLimiter,
  forgetPasswordLimiter,
} = require("../services/rateLimitService");

const ExpressBrute = require("express-brute");

var store = new ExpressBrute.MemoryStore();
// stores state locally, don't use this in production
var bruteforce = new ExpressBrute(store);

const {
  registerUser,
  loginUser,
  logoutUser,
  forgetPassword,
  resetPassword,
  emailVerify,
} = require("../controllers/authController");

const { getMe } = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");

// Routing Implement
router.post("/register", createAccountLimiter, registerUser);
router.post("/verify", emailVerify);
router.post("/login", bruteforce.prevent, loginUser);
router.get("/me", getMe);
router.post("/reset-password", resetPassword);
router.post("/logout", protect, logoutUser);
router.post("/forgot-password", forgetPasswordLimiter, forgetPassword);

module.exports = router;
