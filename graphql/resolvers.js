require('dotenv').config();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.SECRET_KEY;

module.exports = {
  createUser: function ({ userInput }, req) {
    // const email = args.userInput.email;
    //validation logic here
    const errors = [];
    const email = userInput.email;
    if (!validator.isEmail(email)) {
      errors.push({ message: "E-mail is invalid!" });
    }
    if (
      validator.isEmpty(userInput.password) ||
      !validator.isLength(userInput.password, { min: 5 })
    ) {
      errors.push({ message: "Password must have atleast 5 charater!" });
    }
    if (errors.length > 0) {
      const error = new Error("Invalid input!");
      error.code = 422;
      error.data = errors;
      throw error;
    }
    return User.findOne({ email: email })
      .then((user) => {
        if (user) {
          //if user have in db
          const error = new Error("User is already exist!");
          throw error;
        }
        return bcrypt.hash(userInput.password, 12);
      })
      .then((hashPass) => {
        const user = new User({
          email: userInput.email,
          password: hashPass,
          name: userInput.name,
        });
        return user.save();
      })
      .then((user) => {
        console.log(user);
        return { ...user._doc, id: user._id.toString() };
      });
  },
  login: async function ({email, password}) {
    const user = await User.findOne({email: email});
    if(!user){
        //if user not have in db
        const error = new Error("User is not exist!");
        error.code = 401;
        throw error;
    }
    //check password is correct or not!
    const isEqual = await bcrypt.compare(password, user.password);
    if(!isEqual){
        //if user enter wrong password
        const error = new Error("Wrong password!");
        error.code = 401;
        throw error;
    }
    //create jwt token
    const token = jwt.sign({email: email, userId: user._id.toString()},SECRET_KEY, { expiresIn: '1h'});
    return {token: token, userId: user._id.toString()};
  }
};
