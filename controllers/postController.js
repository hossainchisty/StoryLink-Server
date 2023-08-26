// Basic Lib Imports
const asyncHandler = require("express-async-handler");
const Post = require("../models/postModel");
const handleFileUpload = require("../utility/fileManager");
const verifyAuthorization = require("../utility/verifyAuthorization");

/**
 * @desc  Get posts for a given user request
 * @route   /api/v1/posts/list
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
  const page = parseInt(req.query.page) || 1; // Get the requested page number from query string
  const itemsPerPage = 6; // Number of items to show per page

  const totalPosts = await Post.countDocuments(); // Total number of posts

  const posts = await Post.find()
    .populate("author", ["full_name"])
    .sort({ createdAt: -1 })
    .skip((page - 1) * itemsPerPage) // Calculate the number of posts to skip
    .limit(itemsPerPage); // Limit the number of posts to retrieve

  const totalPages = Math.ceil(totalPosts / itemsPerPage);
  
  const nextPage = page < totalPages ? page + 1 : null; // Calculate the next page number
  const prevPage = page > 1 ? page - 1 : null; // Calculate the previous page number

  res.status(200).json({
    status: 200,
    data: {
      posts,
      currentPage: page,
      totalPages,
      nextPage,
      prevPage,
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
  const { id } = req.params;
  const post = await Post.findById(id).populate("author", ["full_name"]).lean();

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
    const newPath = handleFileUpload(req);
    const { title, content } = req.body;

    const { token } = req.cookies;
    const userData = verifyAuthorization(token);

    const postData = {
      author: userData.id,
      title,
      content,
      cover: newPath,
    };

    const post = await Post.create(postData);
    res.status(201).json({
      status: 201,
      data: post,
      message: "Post created successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
});

/**
 * @desc    Update post
 * @route   /api/v1/post/
 * @method  PUT
 * @access  Private
 */
const updatePost = asyncHandler(async (req, res) => {
  try {
    let newPath = null;
    if (req.file) {
      newPath = handleFileUpload(req);
    }

    const { id, title, content } = req.body;
    const { token } = req.cookies;
    const info = verifyAuthorization(token);

    const post = await Post.findById(id).lean();
    if (!post) {
      return res.status(404).json({
        status: 404,
        message: "Post not found",
      });
    }

    const isAuthor = JSON.stringify(post.author) === JSON.stringify(info.id);
    if (!isAuthor) {
      return res.status(403).json({
        status: 403,
        message:
          "Unauthorized - User does not have permission to update this post",
      });
    }

    await Post.updateOne(
      { _id: id },
      { title, content, cover: newPath ? newPath : post.cover },
    );

    res.status(200).json({
      status: 200,
      message: "Post updated successfully",
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
      error: error.message,
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
