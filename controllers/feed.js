const path = require("path");
const fs = require("fs");
const { validationResult } = require("express-validator");
const Post = require("../models/post");
const { count } = require("console");

exports.getPost = (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  let totalItems;
  Post.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Post.find().skip((currentPage-1) * perPage).limit(perPage);
    })
    .then((posts) => {
      res
        .status(200)
        .json({ message: "Fetching post successfully", posts: posts, totalItems: totalItems });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.createPost = (req, res, next) => {
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
    creator: { name: "Raziullah" },
  });
  post
    .save()
    .then((post) => {
      console.log("Backend post object:", post);
      res.status(201).json({
        message: "Post created successfully!",
        post: post,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getSinglePost = (req, res, next) => {
  const postId = req.params.postId;
  //fetching from database
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post.");
        error.statusCode = 404;
        throw error;
      }
      console.log("single post fetch krte time", post);
      res.status(200).json({ message: "Post fetched.", post: post });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.updatePost = (req, res, next) => {
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
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post.");
        error.statusCode = 404;
        throw error;
      }
      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }
      post.title = title;
      post.content = content;
      post.imageUrl = imageUrl;
      return post.save();
    })
    .then((result) => {
      console.log(result);
      res
        .status(200)
        .json({ message: "Post Updated Successfully", post: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post.");
        error.statusCode = 404;
        throw error;
      }
      clearImage(post.imageUrl); //here we clear image after deleting
      return Post.findByIdAndDelete(postId); //here we delete our post
    })
    .then((result) => {
      console.log(result);
      res.status(200).json({ message: "Delete post Succesfully!" });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
        next(err);
      }
    });
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => {
    console.log(err);
  });
};
