const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

/**
 * @desc   Middleware that verifies user authorization
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in cookies
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // If token not found in cookies, check in Authorization header
  if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from the token
    req.user = await User.findById(decoded.id).select("-password");

    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" &&
      error.message === "invalid signature"
    ) {
      // Handle invalid signature error
      res.status(401);
      throw new Error("Invalid token signature");
    } else {
      // Handle other JWT errors
      console.error(error);
      res.status(401);
      throw new Error("Please authenticate");
    }
  }
});

module.exports = { protect };

