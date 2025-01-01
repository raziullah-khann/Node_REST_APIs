const path = require("path");
const { validationResult } = require("express-validator");
const Post = require("../models/post");

exports.getPost = (req, res, next) => {
  res.status(200).json({
    posts: [
      {
        _id: "1",
        title: "First Post",
        content: "This is the first post!",
        imageUrl: "images/duck.jpg",
        creator: {
          name: "Raziullah",
        },
        createdAt: new Date(),
      },
    ],
  });
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Validation failed, entered data is incorrect",
      errors: errors.array(),
    });
  }
  //suppose we get title and content from the body
  const { title, content } = req.body;
  console.log(title, content);
  //create post in db
  const post = new Post({
    title: title,
    imageUrl: 'images/duck.jpg',
    content: content,
    creator: { name: "Raziullah" },
  });
  post
    .save()
    .then((post) => {
      console.log(post);
      res.status(201).json({
        message: "Post created successfully!",
        post: post,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
