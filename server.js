/* Created by HoangNH40 */
require("dotenv").config();
const http = require("http");
const express = require("express");
const cors = require("cors");
const app = express();
const logger = require("morgan"); // log access route

const errorHandler = require("./middleware/error-handler");

// const path = require('path');
const bodyParser = require("body-parser");
const session = require("express-session");

app.set("PORT", process.env.PORT || 9000);
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true
  })
);

//config mongoDB
const mongoose = require("mongoose");
const { mongoDbUrl } = require("./config/database/mongoDb");

mongoose
  .connect(mongoDbUrl, {
    promiseLibrary: global.Promise,
    useCreateIndex: true,
    useNewUrlParser: true
  })
  .then(db => {
    console.log("MONGODB CONNECTED ! ");
  })
  .catch(err => {
    console.log("COULD NOT CONNECTED ! ", err);
  });

// setup CORS
// var whitelist = ['localhost:3060'];

// var optionsCORS = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1 ) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS !'), false);
//     }
//   }
// }

app.use(cors());

// use Routes
require("./routes/routes")(app);
// app.use(function (req, res, next) {
//     res.status(404);
// });
app.use(errorHandler);

mongoose.connection.on("conected", function() {
  console.log("Mongoose default connection open to ....");
});

// If the connection throws an error
mongoose.connection.on("error", function(err) {
  console.log("Mongoose default connection error: ", err);
});

// When the connection is disconnected
mongoose.connection.on("disconnected", function() {
  console.log("Mongoose default connection disconnected");
});

// created Server
const server = http.createServer(app);
server.listen(app.get("PORT"), function() {
  console.log("Server run on port: " + app.get("PORT"));
});
