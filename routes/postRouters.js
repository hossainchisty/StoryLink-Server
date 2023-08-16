// Basic Lib Imports
const express = require("express");
const router = express.Router();

const {
  getPosts,
  getPostByID,
  getPostsList,
  addPost,
  updatePost,
  deletePost,
} = require("../controllers/postController");


const { protect } = require("../middleware/authMiddleware");

// Get all posts
router.get("/list", getPostsList)


router.route("/").get(protect, getPosts).post(protect, addPost);

router
  .route("/:id")
  .delete(protect, deletePost)
  .put(protect, updatePost)
  .get(protect, getPostByID);



// Exporting the Router
module.exports = router;
