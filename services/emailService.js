// Basic Lib Imports
require("dotenv").config();
const logger = require("../config/_winstonLogger");
const nodemailer = require("nodemailer");

const createTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });
};

/**
 * @desc  Function to send the verification email
 * @param {string} email - Recipient's email address
 * @param {string} verificationLink - Verification link
 */
const sendVerificationEmail = async (email, verificationLink) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: "support@storylink.com",
      to: email,
      subject: "Account Verification",
      text: `Please click the following link to verify your account: ${verificationLink}`,
    };
    const info = await transporter.sendMail(mailOptions);
    logger.info("Verification email sent:", { response: info.response });
  } catch (error) {
    logger.error("Error sending verification email:", error);
  }
};

/**
 * @desc  Function to send the password reset email
 * @param {string} email - Recipient's email address
 * @param {string} resetPasswordLink - Password reset link
 */
const sendResetPasswordLink = async (email, resetPasswordLink) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: "support@storylink.com",
      to: email,
      subject: "Password Reset",
      text: `Please click the following link to reset your password: ${resetPasswordLink}`,
    };
    const info = await transporter.sendMail(mailOptions);
    logger.info("Password reset link sent:", { response: info.response });
  } catch (error) {
    logger.error("Error sending password reset email:", error);
  }
};

module.exports = { sendVerificationEmail, sendResetPasswordLink };
