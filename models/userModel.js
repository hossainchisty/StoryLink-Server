// Basic Lib Imports
const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    full_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
    },
    avatar: {
      type: String,
      required: false,
    },
    bio: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
    },
    isVerified: {
      type: Boolean,
      required: false,
    },
    otp: {
      type: String,
      required: false,
    },
    verificationToken: {
      type: String,
      required: false,
    },
    verificationTokenExpiry: {
      type: Date,
      required: false,
    },
    resetPasswordToken: {
      type: String,
      required: false,
    },
    resetPasswordExpiry: {
      type: Date,
      required: false,
    },
    hasEarnedFirstPostBadge: { type: Boolean, default: false },
  },
  { timestamps: true },
  { versionKey: false },
);

module.exports = mongoose.model("User", userSchema);
