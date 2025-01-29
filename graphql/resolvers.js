require("dotenv").config();
const User = require("../models/user");
const Post = require("../models/post");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const { clearImage } = require('../util/file');

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
        return { ...user._doc, _id: user._id.toString() };
      });
  },
  login: async function ({ email, password }) {
    const user = await User.findOne({ email: email });
    if (!user) {
      //if user not have in db
      const error = new Error("User is not exist!");
      error.code = 401;
      throw error;
    }
    //check password is correct or not!
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      //if user enter wrong password
      const error = new Error("Wrong password!");
      error.code = 401;
      throw error;
    }
    //create jwt token
    const token = jwt.sign(
      { email: email, userId: user._id.toString() },
      SECRET_KEY,
      { expiresIn: "1h" }
    );
    return { token: token, userId: user._id.toString() };
  },
  createPost: async function ({ postInput }, req) {
    //check user user is authenticated or not
    if (!req.isAuth) {
      const error = new Error("User is Not Authenticated!");
      error.code = 401;
      throw error;
    }
    const { title, content, imageUrl } = postInput;
    const errors = [];
    if (validator.isEmpty(title) || !validator.isLength(title, { min: 5 })) {
      errors.push({ message: "Title must have atleast 5 charater!" });
    }
    if (
      validator.isEmpty(content) ||
      !validator.isLength(content, { min: 5 })
    ) {
      errors.push({ message: "Content must have atleast 5 charater!" });
    }
    if (errors.length > 0) {
      const error = new Error("Invalid input!");
      error.code = 422;
      error.data = errors;
      throw error;
    }

    const user = await User.findById(req.userId);
    if (!user) {
      //if user not have in db
      const error = new Error("User is not Authenticated!");
      error.code = 401;
      throw error;
    }

    const post = new Post({
      title: title,
      content: content,
      imageUrl: imageUrl,
      creator: user,
    });
    const createdPost = await post.save();
    //Add post to User's posts
    user.posts.push(createdPost);
    await user.save();
    return {
      ...createdPost._doc,
      _id: createdPost._id.toString(),
      createdAt: createdPost.createdAt.toISOString(),
      updatedAt: createdPost.createdAt.toISOString(),
    };
  },
  getPost: async function ({ page }, req) {
    //check user user is authenticated or not
    if (!req.isAuth) {
      const error = new Error("User is Not Authenticated!");
      error.code = 401;
      throw error;
    }
    if (!page) {
      page = 1;
    }
    const perPage = 2;
    const totalPosts = await Post.find().countDocuments();
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .populate("creator");
    return {
      posts: posts.map((p) => {
        return {
          ...p._doc,
          _id: p._id.toString(),
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        };
      }),
      totalPost: totalPosts,
    };
  },
  post: async function ({ id }, req) {
    if (!req.isAuth) {
      const error = new Error("User is Not Authenticated!");
      error.code = 401;
      throw error;
    }
    const post = await Post.findById(id).populate("creator");
    if (!post) {
      const error = new Error("No post found!");
      error.code = 404;
      throw error;
    }
    return {
      ...post._doc,
      _id: post._id.toString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };
  },
  updatePost: async function ({ id, postInput }, req) {
    //check user login or not
    if (!req.isAuth) {
      const error = new Error("User is Not Authenticated!");
      error.code = 401;
      throw error;
    }
    const post = await Post.findById(id).populate("creator");
    if (!post) {
      const error = new Error("No post found!");
      error.code = 404;
      throw error;
    }
    //check created post user not equal to to current user then throw error
    if (post.creator._id.toString() !== req.userId.toString()) {
      const error = new Error("Not Authorized!");
      error.code = 403;
      throw error;
    }
    //validation logic here
    const { title, content } = postInput;
    const errors = [];
    if (validator.isEmpty(title) || !validator.isLength(title, { min: 5 })) {
      errors.push({ message: "Title must have atleast 5 charater!" });
    }
    if (
      validator.isEmpty(content) ||
      !validator.isLength(content, { min: 5 })
    ) {
      errors.push({ message: "Content must have atleast 5 charater!" });
    }
    if (errors.length > 0) {
      const error = new Error("Invalid input!");
      error.code = 422;
      error.data = errors;
      throw error;
    }
    post.title = postInput.title;
    post.content = postInput.content;

    //if new image add then it will override
    if (postInput.imageUrl !== undefined && postInput.imageUrl !== "") {
      post.imageUrl = postInput.imageUrl; // Only update if a new image is provided
    }
    const updatedPost = await post.save();
    return {
      ...updatedPost._doc,
      _id: updatedPost._id.toString(),
      createdAt: updatedPost.createdAt.toISOString(),
      updatedAt: updatedPost.updatedAt.toISOString(),
    };
  },
  deletePost: async function ({ id }, req) {
    //check user login or not
    if (!req.isAuth) {
      const error = new Error("User is Not Authenticated!");
      error.code = 401;
      throw error;
    }
    const post = await Post.findById(id);
    if (!post) {
      const error = new Error("No post found!");
      error.code = 404;
      throw error;
    }
    //check created post user not equal to to current user then throw error
    if (post.creator.toString() !== req.userId.toString()) {
        const error = new Error("Not Authorized!");
        error.code = 403;
        throw error;
    }
    clearImage(post.imageUrl);
    await Post.findByIdAndDelete(id);
    //and also delete from user posts
    const user = await User.findById(req.userId);
    user.posts.pull(id);
    await user.save();
    return true;
  },
};
