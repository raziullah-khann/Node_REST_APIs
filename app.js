require("dotenv").config();
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");

const feedRoute = require("./routes/feed");
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;

const app = express();

// app.use(bodyParser.urlencoded({extended: false})); //x-www-form-urlencoded <form>
// Middleware to parse JSON bodies
app.use(bodyParser.json()); //application/json

//serve static file 
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/feed", feedRoute);

app.use((error, req, res, next) =>{
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({message: message});
})

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    app.listen(8080, () => {
      console.log("Server is running on http://localhost:8080");
    });
  })
  .catch((err) => {
    console.log(err);
  });
