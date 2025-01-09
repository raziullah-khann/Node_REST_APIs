const path = require("path");
const fs = require("fs");
const { validationResult } = require("express-validator");
const Post = require("../models/post");
const User = require("../models/user");

exports.getPost = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  // let totalItems;
  try {
    const totalItems = await Post.find().countDocuments();
    const posts = await Post.find()
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
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
  let creator;
  //create post in db
  const post = new Post({
    title: title,
    imageUrl: "images/" + imageUrl,
    // imageUrl: imageUrl,
    content: content,
    creator: req.userId,
  });
  post
    .save()
    .then((post) => {
      console.log("Backend post object:", post);
      return User.findById(req.userId);
    })
    .then((user) => {
      creator = user;
      user.posts.push(post);
      return user.save();
    })
    .then((result) => {
      res.status(201).json({
        message: "Post created successfully!",
        post: post,
        creator: { _id: creator._id, name: creator.name },
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

      //here we check user user login and creator are same or not
      if (post.creator.toString() !== req.userId) {
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
      //here we check user user login and creator are same or not
      if (post.creator.toString() !== req.userId) {
        const error = new Error("Not Authorised.");
        error.statusCode = 403;
        throw error;
      }
      clearImage(post.imageUrl); //here we clear image after deleting
      return Post.findByIdAndDelete(postId); //here we delete our post
    })
    .then((result) => {
      return User.findById(req.userId);
    })
    .then((user) => {
      user.posts.pull(postId);
      return user.save();
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
