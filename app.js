"use strict";

//MongoDB connection setup
const { mongoose } = require("mongoose");
const uri =
  "mongodb+srv://demo-user:QPHkauWQattX046M@ssd-node.luetr27.mongodb.net/?retryWrites=true&w=majority";

// set up default mongoose connection
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// store a reference to the default connection
const db = mongoose.connection;

// Bind connection to error event (to get notification of connection errors)
db.on("error", console.error.bind(console, "MongoDB connection error:"));

const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const fileUpload = require('express-fileupload');

const passport = require("passport");
const LocalStrategy = require("passport-local");

const cors = require("cors");
const expressLayouts = require("express-ejs-layouts");

const app = express();
const port = process.envPORT || 3003;

// load our routers
const indexRouter = require("./routers/indexRouter");
const profilesRouter = require("./routers/profilesRouter");
const userRouter = require("./routers/userRouter");

// load request service 
const RequestService = require("../Node-Project/services/RequestService");

// tell Express where to find our templates (views)
app.set("views", path.join(__dirname, "views"));
// set the view engine to ejs
app.set("view engine", "ejs");

app.use(cors({ origin: [/127.0.0.1*/, /localhost*/] }));

// Morgan Logging Middleware
const logger = require("morgan");
// Using logger as middleware, with 3 different output templates
app.use(logger("dev")); // method, path, status, time

// Express.static middleware to make the public folder globally accessible
app.use(express.static("public"));

app.use(fileUpload());
// Enable layouts
app.use(expressLayouts);
// Set the default layout
app.set("layout", "./layouts/full-width");

// route to demonstrate EJS rendering a static HTML file
app.get("/static", (req, res) => res.render("static"));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// Set up session management with mongodb as our store
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const store = new MongoDBStore({
  uri: uri, //reusing uri from above
  collection: "sessions",
});

// Catch errors
store.on("error", function (error) {
  console.log(error);
});

app.use(
  require("express-session")({
    secret: "a long time ago in a galaxy far far away",
    resave: true,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 20 }, // 20 minutes
    store: store,
  })
);

// Initialize passport and configure for User model
app.use(passport.initialize());
app.use(passport.session());
const User = require("./models/User");
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// index routes
app.use(indexRouter);

// User routes
app.use("/user", userRouter);

// profile routes
app.use("/profiles", profilesRouter);

const authenticatedUser = function (req, res, next) {
  let reqInfo = RequestService.reqHelper(req);
  console.log("authenticated");
  if (reqInfo.authenticated) {

    next()
  } else {
    res.redirect(
      "/user/login?errorMessage=You must be logged in to view this page."
    );
  }
};

app.use(authenticatedUser)

// catch any unmatched routes
app.all("/*", (req, res) => {
  res.status(404).send("File Not Found");
});

// start listening
app.listen(port, () => console.log(`Example app listening on port ${port}!`));