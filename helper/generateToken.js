// Basic Lib Imports
const jwt = require("jsonwebtoken");

// Generate JWT Token
const generateToken = (id, full_name) => {
  return jwt.sign({ id, full_name }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

module.exports = { generateToken };
