// Basic Lib Imports
const jwt = require("jsonwebtoken");

/**
 * @desc Generate JWT Token
 * @requires User id
 * */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

/**
 * @desc Generate reset password token and set expiry time
 *
 * */
const generateResetToken = () => {
  const resetPasswordToken = crypto.randomBytes(20).toString("hex");
  const resetPasswordExpiry = Date.now() + 3600000; // Token expires in 1 hour

  return { resetPasswordToken, resetPasswordExpiry };
};

module.exports = { generateToken, generateResetToken };
