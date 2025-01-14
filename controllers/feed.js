const path = require("path");
const fs = require("fs");
const { validationResult } = require("express-validator");
const Post = require("../models/post");
const User = require("../models/user");
const io = require('../socket');

exports.getPost = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  // let totalItems;
  try {
    const totalItems = await Post.find().countDocuments();
    const posts = await Post.find().populate('creator').sort({createdAt: -1})
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
      console.log("sabhi post populate hone ke baad mil rha h",posts);
    res.status(200).json({
      message: "Fetching post successfully",
      posts: posts,
      totalItems: totalItems,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.createPost = async (req, res, next) => {
  const image = req.file;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect");
    error.statusCode = 422;
    throw error;
  }

  if (!image) {
    const error = new Error("No image provide!");
    error.statusCode = 422;
    throw error;
  }
  console.log("image object hai create karte time ka", image);
  const imageUrl = image.filename;
  // const imageUrl = image.path;
  //suppose we get title and content from the body
  const { title, content } = req.body;
  console.log(title, content);
  //create post in db
  const post = new Post({
    title: title,
    imageUrl: "images/" + imageUrl,
    // imageUrl: imageUrl,
    content: content,
    creator: req.userId,
  });
  try {
    await post.save();
    console.log("Backend post object:", post);
    const user = await User.findById(req.userId);
    user.posts.push(post);
    await user.save();
    io.getIO().emit('posts', { action: 'create', post: {...post._doc, creator: {_id: req.userId, name: user.name}}});
    // console.log('Emitting posts event', post);
    res.status(201).json({
      message: "Post created successfully!",
      post: post,
      creator: { _id: user._id, name: user.name },
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getSinglePost = async (req, res, next) => {
  const postId = req.params.postId;
  //fetching from database
  const post = await Post.findById(postId);
  try {
    if (!post) {
      const error = new Error("Could not find post.");
      error.statusCode = 404;
      throw error;
    }
    console.log("single post fetch krte time", post);
    res.status(200).json({ message: "Post fetched.", post: post });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updatePost = async (req, res, next) => {
  const postId = req.params.postId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect");
    error.statusCode = 422;
    throw error;
  }

  const { title, content } = req.body;
  let imageUrl = req.body.image; //here we extract our image from req.body

  if (req.file) {
    //if we select new image then it found in req.file
    imageUrl = "images/" + req.file.filename;
  }
  if (!imageUrl) {
    const error = new Error("No provided image!");
    error.statusCode = 422;
    throw error;
  }

  //here we know our data is correct to pass validation and image new or prior
  //now we store in database
  try {
    const post = await Post.findById(postId).populate('creator');
    if (!post) {
      const error = new Error("Could not find post.");
      error.statusCode = 404;
      throw error;
    }

    //here we check user user login and creator are same or not
    if (post.creator._id.toString() !== req.userId) {
      const error = new Error("Not Authorised.");
      error.statusCode = 403;
      throw error;
    }
    if (imageUrl !== post.imageUrl) {
      clearImage(post.imageUrl);
    }
    post.title = title;
    post.content = content;
    post.imageUrl = imageUrl;
    const result = await post.save();
    console.log("update karne ke baad post hai",result);
    io.getIO().emit('posts', { action: 'update', post: result})
    res
      .status(200)
      .json({ message: "Post Updated Successfully", post: result });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);

    if (!post) {
      const error = new Error("Could not find post.");
      error.statusCode = 404;
      throw error;
    }
    //here we check user user login and creator are same or not
    if (post.creator.toString() !== req.userId) {
      const error = new Error("Not Authorised.");
      error.statusCode = 403;
      throw error;
    }

    clearImage(post.imageUrl); //here we clear image after deleting
    await Post.findByIdAndDelete(postId); //here we delete our post

    const user = await User.findById(req.userId); //here find user and delete post from user posts
    user.posts.pull(postId);
    const result = await user.save();

    console.log(result);
    io.getIO().emit('posts', { action: 'delete', post: postId });
    res
      .status(200)
      .json({ message: "Delete post Succesfully!", result: result });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      next(err);
    }
  }
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => {
    console.log(err);
  });
};
