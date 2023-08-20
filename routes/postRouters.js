// Basic Lib Imports
const express = require("express");
const multer = require("multer");
const router = express.Router();

const {
  getPosts,
  getPostByID,
  getPostsList,
  addPost,
  updatePost,
  deletePost,
} = require("../controllers/postController");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const uploadMiddleware = multer({ storage: storage }).single("image");

// Get all posts
router.get("/list", getPostsList);

router
  .route("/")
  .get(getPosts)
  .post(uploadMiddleware, addPost)
  .put(uploadMiddleware, updatePost);

router.route("/:id").delete(deletePost).get(getPostByID);

// Exporting the Router
module.exports = router;
