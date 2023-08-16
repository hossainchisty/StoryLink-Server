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
    password: {
      type: String,
      required: [true, "Please add a password"],
      // min: 4,
      // max: 16
    },
    token: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
  { versionKey: false },
);

module.exports = mongoose.model("User", userSchema);
