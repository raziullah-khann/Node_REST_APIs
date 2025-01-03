const path = require("path");
const { validationResult } = require("express-validator");
const Post = require("../models/post");

exports.getPost = (req, res, next) => {
  Post.find().then(posts => {
    res.status(200).json({message: 'Fetching post successfully', posts:posts})
  }).catch(err=> {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  })
};

exports.createPost = (req, res, next) => {
  const image = req.file;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect");
    error.statusCode = 422;
    throw error;
  }

  if(!image){
    const error = new Error('No image provide!');
    error.statusCode = 422;
    throw error;
  }
  console.log("image object hai create karte time ka",image);
  const imageUrl = image.path;

  //suppose we get title and content from the body
  const { title, content } = req.body;
  console.log(title, content);
  //create post in db
  const post = new Post({
    title: title,
    // imageUrl: 'images/'+imageUrl,
    imageUrl: imageUrl,
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
      console.log("single post fetch krte time",post);
      res.status(200).json({message: 'Post fetched.', post: post})
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
