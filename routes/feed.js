const express = require("express");
const {check, body} = require("express-validator");

const feedController = require("../controllers/feed");

const router = express.Router(); //creates a lightweight, modular route handler. A router behaves like a mini Express application that is capable of handling routes and middleware.

// GET /feed/posts
router.get("/posts", feedController.getPost);

// POST /feed/posts
router.post("/post", [body('title').trim().isLength({min:5}), body('content').trim().isLength({min:5})], feedController.createPost);

module.exports = router;