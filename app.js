// Basic Lib Imports
const express = require("express"); // Importing the Express framework for building web applications
const helmet = require("helmet"); // Importing Helmet middleware for securing HTTP headers
const bodyParser = require('body-parser'); // Importing Body Parser middleware for parsing request bodies
const cookieParser = require('cookie-parser'); // Importing Cookie Parser middleware for parsing cookies 
require("dotenv").config(); // Loading environment variables from .env file
const cors = require('cors'); // Importing CORS middleware for enabling Cross-Origin Resource Sharing
const { errorHandler } = require("./middleware/errorMiddleware"); // Importing custom error handling middleware

// Database connection with mongoose
const connectDB = require("./config/db"); // Importing database connection function using Mongoose
connectDB(); // Establishing the database connection



const app = express(); // Creating an instance of the Express application
app.use('/uploads', express.static(__dirname + '/uploads')); // Serve uploaded files from the 'uploads' folder

app.use(helmet()); // Setting up Helmet middleware for securing HTTP headers
app.use(bodyParser.json()); // Parsing JSON bodies
app.use(cookieParser()); // Parsing cookies
app.use(express.json()); // Parsing JSON bodies
app.use(cors(
  {
    origin: `${process.env.FRONTEND_URL}`,
    credentials: true
  }
)); // Enabling CORS for localhost origins
app.use(
  express.urlencoded({
    extended: false,
  })
);

// Routing Implement
app.use("/api/v1/users", require("./routes/userRouters")); // Mounting userRouters for handling user-related routes
app.use("/api/v1/posts", require("./routes/postRouters")); // Mounting postRouters for handling task-related routes

// Undefined Route Implement
app.use("/", (req, res) => {
  res.status(200).json({ status: 200, message: "Health OK🛡" });
});

// Undefined Route Implement
app.use("*", (req, res) => {
  res.status(404).json({ status: 404, message: "Not Found" });
});

// Custom error handler
app.use(errorHandler);

module.exports = app; // Exporting the Express app for external use