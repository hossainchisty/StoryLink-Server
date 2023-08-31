// Basic Lib Import
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

module.exports = {
  getMe,
};
