const express = require("express");
const bodyParser = require("body-parser");

const feedRoute = require("./routes/feed");

const app = express();

// app.use(bodyParser.urlencoded({extended: false})); //x-www-form-urlencoded <form>
// Middleware to parse JSON bodies
app.use(bodyParser.json()); //application/json

app.use("/feed", feedRoute)

app.listen(8080, () => {
    console.log("Server is running on http://localhost:8080");
})