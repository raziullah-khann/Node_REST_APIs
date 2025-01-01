const express = require("express");
const bodyParser = require("body-parser");

const feedRoute = require("./routes/feed");
const { default: mongoose } = require("mongoose");

const app = express();

// app.use(bodyParser.urlencoded({extended: false})); //x-www-form-urlencoded <form>
// Middleware to parse JSON bodies
app.use(bodyParser.json()); //application/json

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

mongoose
  .connect(
    "mongodb+srv://Raziullah-Khan:AXLIVFo3hpQp1jRF@cluster0.frgxn.mongodb.net/messages?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(result => {
      app.listen(8080, () => {
        console.log("Server is running on http://localhost:8080");
      });
  })
  .catch((err) => {
    console.log(err);
  });
