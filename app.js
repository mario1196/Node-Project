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
const cors = require("cors");
const expressLayouts = require("express-ejs-layouts");

const app = express();
const port = process.envPORT || 3003;

// load our routers
const apiRouter = require("./routers/apiRouter");
const indexRouter = require("./routers/indexRouter");
const profilesRouter = require("./routers/profilesRouter");

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

// Enable layouts
app.use(expressLayouts);
// Set the default layout
app.set("layout", "./layouts/full-width");

// route to demonstrate EJS rendering a static HTML file
app.get("/static", (req, res) => res.render("static"));

// sending data to an EJS view for dynamic output

//app.get("/users", (req, res) => res.render("profiles", viewData));

// route for the josh page, which includes static resources
//app.get("/josh", (req, res) => res.sendFile(__dirname + "/pages/josh.html"));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// index routes
app.use(indexRouter);

// movie routes
app.use("/profiles", profilesRouter);

// api routes
app.use("/api", apiRouter);

// catch any unmatched routes
app.all("/*", (req, res) => {
  res.status(404).send("File Not Found");
});

// start listening
app.listen(port, () => console.log(`Example app listening on port ${port}!`));