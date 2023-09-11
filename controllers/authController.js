// Basic Lib Import
require("dotenv").config();
const moment = require("moment");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const {
  generateToken,
  generateResetToken,
} = require("../helper/generateToken");
const {
  sendVerificationEmail,
  sendResetPasswordLink,
} = require("../services/emailService");

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
    const usersToCreate = [
      {
        full_name,
        email,
        verificationToken: crypto.randomBytes(20).toString("hex"),
        verificationTokenExpiry: moment().add(1, "hour"),
        password: hashedPassword,
      },
    ];
    const [createdUser] = await User.insertMany(usersToCreate);

    if (createdUser) {
      // Send verification email
      const domain = process.env.FRONTEND_URL;
      const verificationLink = `${domain}/verify/${createdUser.verificationToken}`;
      sendVerificationEmail(createdUser.email, verificationLink);

      res.status(201).json({
        status: 201,
        message: "Please check your email to verify your account.",
      });
    } else {
      res.status(400).json({
        status: 400,
        error: "Bad Request",
        message: "User with the provided data unprocessable.",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: error,
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
      error: "404 Not Found",
      message: "User not found",
    });
  }

  if (!user.isVerified) {
    return res.status(403).json({
      status: 403,
      error: "Forbidden",
      message: "User not verified",
    });
  }

  if (user && (await bcrypt.compare(password, user.password))) {
    // Generate and set the token as a cookie
    const token = generateToken(user._id, user.full_name);
    res
      .cookie("token", token, {
        sameSite: "none",
        secure: true,
        httpOnly: true,
      })
      .json({
        status: 200,
        id: user._id,
        full_name: user.full_name,
        token: token,
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
  res.cookie("token", null).json({
    status: 200,
    message: "Logged out successfully",
  });
});

/**
 * @desc    User email verification
 * @route   /api/v1/users/verify
 * @method  POST
 * @param   {String} user token
 * @access  Public
 */

const emailVerify = asyncHandler(async (req, res) => {
  const { token } = req.query;

  try {
    // Find the user by verification token
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(404).json({ message: "Invalid verification token" });
    }

    // Check if the verification token has expired
    const now = moment();
    if (now.isAfter(user.verificationTokenExpiry)) {
      return res
        .status(400)
        .json({ message: "Verification token has expired" });
    }

    // Update user as verified
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    user.isVerified = true;
    await user.save();

    return res.status(200).json({ message: "User verified successfully" });
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: error,
      message: "An internal server error occurred.",
    });
  }
});

/**
 * @desc    Forgot Password
 * @route   /api/v1/users/forgot-password
 * @method  POST
 * @access  Public
 * @param   {string} email - User's email address
 * @returns {object} - Success message or error message
 */
const forgetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: "User not found",
      });
    }

    const { resetPasswordToken, resetPasswordExpiry } = generateResetToken();

    // Update user document with reset password token and expiry
    await User.findOneAndUpdate(
      { email },
      {
        $set: {
          resetPasswordToken,
          resetPasswordExpiry,
        },
      },
    );

    // Send password reset email
    const domain = process.env.FRONTEND_URL;
    const passwordRestLink = `${domain}/api/v1/users/reset-password?token=${resetPasswordToken}`;
    sendResetPasswordLink(user.email, passwordRestLink);

    res.status(200).json({
      status: 200,
      message: "Link has been sent to your email!",
    });
  } catch (error) {
    res.status(400).json({
      status: 400,
      error: "Bad Request",
      message: "Email not found",
      details: "The provided email address does not exist in our records.",
    });
  }
};

/**
 * @desc    Reset Password
 * @route   /api/v2/users/reset-password
 * @method  POST
 * @access  Public
 * @param   {string} token - Reset password token received in email
 * @param   {string} newPassword - User's new password
 * @returns {object} - Success message or error message
 */
const resetPassword = async (req, res) => {
  const { newPassword } = req.body;
  const { token } = req.query;

  try {
    // Find user by the reset password token and ensure it's valid and not expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({
        status: 400,
        message: "Invalid or expired token",
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    res.status(200).json({
      status: 200,
      message: "Password reset successful",
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: "Internal Server Error",
      message: "An internal server error occurred.",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  forgetPassword,
  resetPassword,
  emailVerify,
};
