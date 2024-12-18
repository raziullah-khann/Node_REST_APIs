const express = require("express");

const feedController = require("../controllers/feed");

const router = express.Router(); //creates a lightweight, modular route handler. A router behaves like a mini Express application that is capable of handling routes and middleware.

// GET /feed/posts
router.get("/posts", feedController.getPost);

module.exports = router;