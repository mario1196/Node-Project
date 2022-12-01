const express = require("express");
const indexRouter = express.Router();

indexRouter.get("/", (req, res) => res.render("index", {title: "Home"}));
indexRouter.get("/about", (req, res) => res.render("about", {title: "About Us"}));
//indexRouter.get("/contact", (req, res) => res.render("contact", {title: "Contact"}));

indexRouter.get("/contact", (req, res) => {
    res.render("contact", {
      title: "Contact",
      status: null,
    });
  });
  
  indexRouter.post("/contact", (req, res) => {
    res.render("contact", {
      title: "Contact",
      status: "received",
      formData: req.body,
    });
  });

module.exports = indexRouter;