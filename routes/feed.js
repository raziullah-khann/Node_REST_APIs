const express = require("express");
const {check, body} = require("express-validator");

const feedController = require("../controllers/feed");
const isAuth = require('../middleware/is-auth');

const router = express.Router(); //creates a lightweight, modular route handler. A router behaves like a mini Express application that is capable of handling routes and middleware.

// GET /feed/posts
router.get("/posts", isAuth, feedController.getPost);

// POST /feed/posts
router.post("/post", isAuth, [body('title').trim().isLength({min:5}), body('content').trim().isLength({min:5})], feedController.createPost);

//fetching single post from db
router.get("/post/:postId", isAuth, feedController.getSinglePost);

//updating post
router.put("/post/:postId", isAuth, [body('title').trim().isLength({min:5}), body('content').trim().isLength({min:5})], feedController.updatePost);

//deleting post
router.delete("/post/:postId", isAuth, feedController.deletePost);

module.exports = router;