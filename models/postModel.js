// Basic Lib Imports
const mongoose = require("mongoose");

/*
  Post Schema Definition
  
*/

const postSchema = mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: "User",
    },
    title: {
      type: String,
      required: [true, "Please add a text value"],
    },
    cover: {
      type: String,
    },
    content: {
      type: String,
      required: true,
    },
    isDraft: { type: Boolean, default: false, index: true },
    notifications: { type: Boolean, default: true },
  },
  { timestamps: true },
  { versionKey: false },
);

module.exports = mongoose.model("Post", postSchema);
