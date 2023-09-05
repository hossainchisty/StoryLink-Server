// Basic Lib Import
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const verifyAuthorization = require("../utility/verifyAuthorization");

/**
 * @desc    Get user data
 * @route   /api/V1/users/me
 * @method  GET
 * @access  Private
 */

const getMe = asyncHandler(async (req, res) => {
  const { token } = req.cookies;
  try {
    const info = verifyAuthorization(token);
    res.json(info);
  } catch (error) {
    res.status(401).json({
      status: error.status,
      error: error.message,
      message: "Authorization failed",
    });
  }
});

/**
 * @desc    Get all user data
 * @route   /api/v1/users/list
 * @method  GET
 * @access  Private
 */

const userList = asyncHandler(async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: error.message,
      message: "Internal Server Error",
    });
  }
});

module.exports = {
  getMe,
  userList,
};
