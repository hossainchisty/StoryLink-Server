// Basic Lib Import
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const { generateToken } = require("../helper/generateToken");
const randomString = require("randomstring");
const { sendResetPasswordEmail } = require("../helper/sendEmail");
const jwt = require("jsonwebtoken");

/**
 * @desc    Register new user
 * @route   /api/v1/users/register
 * @method  POST
 * @access  Public
 */

const registerUser = asyncHandler(async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    if (!full_name) {
      return res.status(400).json({
        status: 400,
        message: "Validation error",
        errors: [
          {
            field: "full_name",
            message: "Full name field is required",
          },
        ],
      });
    }

    if (!email) {
      return res.status(400).json({
        status: 400,
        message: "Validation error",
        errors: [
          {
            field: "email",
            message: "Email field is required",
          },
        ],
      });
    }

    if (!password) {
      return res.status(400).json({
        status: 400,
        message: "Validation error",
        errors: [
          {
            field: "password",
            message: "Password field is required",
          },
        ],
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({
        status: 409,
        error: "User already exists",
        message:
          "A user with the provided information already exists in the system.",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      full_name,
      email,
      password: hashedPassword,
    });

    if (user) {
      res.status(201).json({
        status: 201,
        data: {
          id: user._id,
          full_name: user.full_name,
          email: user.email,
          password: user.password,
        },
        message: "User created successfully.",
      });
    } else {
      res.status(400).json({
        status: 400,
        error: "Bad Request",
        message: "User with the provided data unprocessable.",
      });
    }
  } catch (error) {
    // Handle any errors that occur within the try block
    console.error("An error occurred:", error);
    res.status(500).json({
      status: 500,
      error: "Internal Server Error",
      message: "An internal server error occurred.",
    });
  }
});


/**
 * @desc    Authenticate a user
 * @route   /api/v1/users/login
 * @method  POST
 * @access  Public
 */

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // Check for user email
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404).json({
      status: 404,
      error: '404 Not Found',
      message: 'User not found'
    });
  }
  if (user && (await bcrypt.compare(password, user.password))) {
    // Generate and set the token as a cookie
    const token = generateToken(user._id, user.full_name);
    res.status(200).cookie("token", token).json({
      status: 200,
      message: "Logged in successfully",
    });
  } else {
    res.status(400).json({
      status: 400,
      error: "Bad Request",
      message: "Invalid credentials",
    });
  }
});

/**
 * @desc    Logs out the currently logged-in user by invalidating the JWT token.
 * @route   /api/v1/users/logout
 * @method  POST
 * @access  Private
 * @requires Logged User
 * @returns {string} 200 OK: Returns a success message indicating successful logout.
 */

const logoutUser = asyncHandler(async (req, res) => {
  // Update the user's token to invalidate it
  res.cookie('token', null).res.status(200).json({
    status: 200,
    message: "Logged out successfully",
  });
});

/**
 * @desc    Get user data
 * @route   /api/V1/users/me
 * @method  GET
 * @access  Private
 */

const getMe = asyncHandler(async (req, res) => {
  const { token } = req.cookies;
  jwt.verify(token, process.env.JWT_SECRET, {}, (err, info) => {
    if (err) throw err;
    res.json(info);
  });
});

/**
 * @desc    Handles the forget password functionality for users
 * @route   /api/v1/users/forget-password
 * @method  POST
 * @access  Public
 */

const forgetPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      status: 400,
      message: "Validation error",
      errors: [
        {
          field: "email",
          message: "Email field is required",
        },
      ],
    });
  }

  // Generate random token
  const generateToken = randomString.generate();

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    await User.updateOne({ email }, { $set: { token: generateToken } });

    // Print reset password email details in console
    await sendResetPasswordEmail(email, generateToken);

    res.status(200).json({
      status: "success",
      code: 200,
      message: "Link has been sent to your email!",
    });
  } else {
    res.status(400).json({
      status: 400,
      error: "Bad Request",
      message: "Email not found",
      details: "The provided email address does not exist in our records.",
    });
  }
});

/**
 * @desc    Handles the password reset functionality for users
 * @route   /api/v1/users/reset-password
 * @method  POST
 * @param   {Object} req - The request object
 * @param   {Object} res - The response object
 * @returns {Object} JSON response indicating the success or failure of the password reset
 * @throws  {Error} If an error occurs while resetting the password
 */
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Validate the token and find the user
    const user = await User.findOne({ token });
    if (!user) {
      res.status(401).json({
        status: 401,
        error: "Unauthorized",
        message: "Invalid or expired token.",
        suggestion: "Please provide a valid authentication token.",
      });
      return;
    }

    // Update the user's password
    user.password = newPassword;
    user.token = null; // Remove the token after password reset
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful.",
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "An error occurred while resetting the password.",
      error: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  forgetPassword,
  resetPassword,
};