// Basic Lib Imports
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Post = require("../models/postModel");


/**
 * @desc  Get posts for a given user request
 * @route   /api/v1/posts/
 * @method  GET
 * @access  Private
 */

const getPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({ user: req.user.id }).sort({ createdAt: -1 });

  res.status(200).json({
    status: 200,
    data: {
      posts,
    },
  });
});

/**
 * @desc  Get list of posts
 * @route   /api/v1/post/lists
 * @method  GET
 * @access  Public
 */

const getPostsList = asyncHandler(async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.status(200).json({
    status: 200,
    data: {
      posts,
    },
  });
});

/**
 * @desc    Get a post
 * @route   /api/v1/posts/:postID
 * @method  GET
 * @access  Private
 * @return Post based on the given id
 */

const getPostByID = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postID).lean();

  if (!post) {
    return res.status(404).json({
      status: 404,
      error: "Not Found",
      message: "Post not found.",
    });
  }

  return res.status(200).json({
    status: 200,
    data: post,
  });
});

/**
 * @desc    Create a new post for the authenticated user
 * @route   /api/v1/posts
 * @method  POST
 * @access  Private
 * @returns {object} Newly added post in json format
 */

const addPost = asyncHandler(async (req, res) => {
  try {
    // Destructure request body
    const {
      title,
      description,
    } = req.body;

    // Check for required title field
    if (!title) {
      return res.status(400).json({
        status: 400,
        message: "Validation error",
        errors: [
          {
            field: "title",
            message: "Title field is required",
          },
        ],
      });
    }

    // Create a new task
    const taskData = {
      user: req.user.id,
      title,
      description,
    };

    const task = await Post.create(taskData);
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
});

/**
 * @desc    Update post
 * @route   /api/v1/post/:id
 * @method  PUT
 * @access  Private
 */
const updatePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { id: userId } = req.user;

  try {
    const post = await Post.findById(id).lean();
    if (!post) {
      return res.status(404).json({
        status: 404,
        message: "Post not found",
      });
    }

    // Make sure the logged-in user matches the post user
    if (post.user.toString() !== userId) {
      return res.status(403).json({
        status: 403,
        message:
          "Unauthorized - User does not have permission to update this post",
      });
    }

    await Post.updateOne({ _id: id, user: userId }, req.body);
    const updatedPost = await Post.findById(id);
    res.status(200).json({
      status: 200,
      message: "Post updated successfully",
      data: updatedPost,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "An error occurred while updating the post",
    });
  }
});

/**
 * @desc    Delete post
 * @route   /api/v1/posts/:id
 * @method  DELETE
 * @access  Private
 */
const deletePost = asyncHandler(async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!req.user) {
      res.status(401).json({
        status: 401,
        message: "User not authenticated",
        suggestion: "Please provide a valid authentication information.",
      });
    }

    if (post.user.toString() !== req.user.id) {
      res.status(401).json({
        status: 401,
        error: "Unauthorized",
        message: "User is authenticated but not authorized",
        suggestion: "Please provide a valid authentication information.",
      });
    }

    const deletedPost = await Post.findByIdAndRemove(req.params.id, req.body, {
      new: true,
    });

    if (!deletedPost) {
      res.status(404).json({
        status: 404,
        message: "Post not found",
      });
    }

    res.status(200).json({
      data: deletedPost,
      id: req.params.id,
      message: "Post was deleted.",
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: error.message
    });
  }
});



module.exports = {
  getPosts,
  getPostByID,
  getPostsList,
  addPost,
  updatePost,
  deletePost,
};
