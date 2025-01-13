const express = require("express");
const { body } = require("express-validator");
const User = require("../models/user");
const authController = require('../controllers/auth');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.put("/signup", [
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email!")
    .custom((value, {}) => {
      return User.findOne({ email: value }).then((user) => {
        if (user) {
          return Promise.reject(
            "E-mail is already exist, please pick different one!"
          );
        }
      });
    })
    .normalizeEmail(),
  body("password","Please enter password only number and text atleat 5 characters.").trim().isLength({ min: 5 }).isAlphanumeric(),
  body("name")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Please enter name minimum 3 caracter!"),
], authController.signup);

router.post('/login', authController.login);

module.exports = router;
