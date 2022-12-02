const User = require("../models/User");
const passport = require("passport");
const RequestService = require("../services/RequestService");

// import and instantiate our userOps object
const UserOps = require("../data/UserOps");
const _userOps = new UserOps();

// Displays registration form.
exports.Register = async function (req, res) {
  let reqInfo = RequestService.reqHelper(req);
  res.render("user/register", { errorMessage: "", user: {}, reqInfo: reqInfo, title: "Register" });
};

// Handles 'POST' with registration form submission.
exports.RegisterUser = async function (req, res) {
  const password = req.body.password;
  const passwordConfirm = req.body.passwordConfirm;

  if (password == passwordConfirm) {
    // Creates user object with mongoose model.
    // Note that the password is not present.
    const newUser = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      username: req.body.username,
    });

    // Uses passport to register the user.
    // Pass in user object without password
    // and password as next parameter.
    User.register(
      new User(newUser),
      req.body.password,
      function (err, account) {
        // Show registration form with errors if fail.
        if (err) {
          let reqInfo = RequestService.reqHelper(req);
          return res.render("user/register", {
            user: newUser,
            errorMessage: err,
            reqInfo: reqInfo,
          });
        }
        // User registered so authenticate and redirect to profile
        passport.authenticate("local")(req, res, function () {
          res.redirect("/profiles");
        });
      }
    );
  } else {
    let reqInfo = RequestService.reqHelper(req);
    res.render("user/register", {
      user: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        username: req.body.username,
      },
      errorMessage: "Passwords do not match.",
      reqInfo: reqInfo,
    });
  }
};

// Shows login form.
exports.Login = async function (req, res) {
  let reqInfo = RequestService.reqHelper(req);
  let errorMessage = req.query.errorMessage;

  res.render("user/login", {
    user: {},
    errorMessage: errorMessage,
    reqInfo: reqInfo,
    title: "Login"
  });
};

// Receives login information & user roles, then store roles in session and redirect depending on authentication pass or fail.
exports.LoginUser = async (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/profiles",//"/user/profile",
    failureRedirect: "/user/login?errorMessage=Invalid login.",
  })(req, res, next);
};

// Log user out and direct them to the login screen.
exports.Logout = (req, res) => {
  // Use Passports logout function
  req.logout((err) => {
    if (err) {
      console.log("logout error");
      return next(err);
    } else {
      // logged out.  Update the reqInfo and redirect to the login page
      let reqInfo = RequestService.reqHelper(req);

      res.render("user/login", {
        user: {},
        isLoggedIn: false,
        errorMessage: "",
        reqInfo: reqInfo,
        title: "Login"
      });
    }
  });
};

exports.Profile = async function (req, res) {
  let reqInfo = RequestService.reqHelper(req);
  if (reqInfo.authenticated) {
    let roles = await _userOps.getRolesByUsername(reqInfo.username);
    let sessionData = req.session;
    sessionData.roles = roles;
    reqInfo.roles = roles;
    let userInfo = await _userOps.getUserByUsername(reqInfo.username);
    return res.render("user/profile", {
      reqInfo: reqInfo,
      userInfo: userInfo,
    });
  } else {
    res.redirect(
      "/user/login?errorMessage=You must be logged in to view this page."
    );
  }
};

// Manager Area available to users who belong to Admin and/or Manager role
exports.ManagerArea = async function (req, res) {
  let reqInfo = RequestService.reqHelper(req, ["Admin", "Manager"]);

  if (reqInfo.rolePermitted) {
    res.render("user/manager-area", { errorMessage: "", reqInfo: reqInfo });
  } else {
    res.redirect(
      "/user/login?errorMessage=You must be a manager or admin to access this area."
    );
  }
};

// Admin Area available to users who belong to Admin role
exports.AdminArea = async function (req, res) {
  let reqInfo = RequestService.reqHelper(req, ["Admin"]);

  if (reqInfo.rolePermitted) {
    res.render("user/admin-area", { errorMessage: "", reqInfo: reqInfo });
  } else {
    res.redirect(
      "/user/login?errorMessage=You must be an admin to access this area."
    );
  }
};