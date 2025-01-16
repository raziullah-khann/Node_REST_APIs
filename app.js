require("dotenv").config();
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const { graphqlHTTP } = require('express-graphql');

const graphqlSchema = require('./graphql/schema');
const graphqlResolvers = require('./graphql/resolvers');

const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;

const app = express();

//here we configure multer
const fileStorage = multer.diskStorage({
  destination: (req, file, cb)=>{
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname);
  }
}); 

const fileFilter = (req, file, cb) => {
  if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png'){
    cb(null, true);
  }else{
    cb(null, false);
  }
}
// app.use(bodyParser.urlencoded({extended: false})); //x-www-form-urlencoded <form>
// Middleware to parse JSON bodies
app.use(bodyParser.json()); //application/json

//here we register multer
app.use(multer({ fileFilter: fileFilter, storage: fileStorage}).single('image'));
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

// GraphQL endpoint
app.use('/graphql', graphqlHTTP({
  schema: graphqlSchema,
  rootValue: graphqlResolvers,
}))

app.use((error, req, res, next) =>{
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({message: message, data: data});
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
