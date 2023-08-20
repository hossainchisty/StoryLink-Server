// Basic Lib Imports
const jwt = require("jsonwebtoken");

const verifyAuthorization = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = verifyAuthorization;
