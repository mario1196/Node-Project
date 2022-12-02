const ProfileController = require("../controllers/ProfileController");

const express = require("express");
const path = require("path");
const fs = require("fs").promises;
const profilesRouter = express.Router();

const dataPath = path.join(__dirname, "../data/");

//profilesRouter.get("/", );

//profilesRouter.get("/:profileId", );

profilesRouter.get("/", ProfileController.Index);

profilesRouter.post("/", ProfileController.Index);

//profilesRouter.get("/create", ProfileController.Create);
//profilesRouter.post("/create", ProfileController.CreateProfile);

//*Show Create Profile Form
//profilesRouter.get("/edit/:id", ProfileController.Edit);
// Handle Create Profile Form Submission
//profilesRouter.post("/edit/:id", ProfileController.EditProfile);

// Show Create Profile Form
profilesRouter.get("/edit", ProfileController.Create);
// Handle Create Profile Form Submission
profilesRouter.post("/edit", ProfileController.CreateProfile);

// Show Create Profile Form
profilesRouter.get("/edit/:id", ProfileController.Edit);
// Handle Create Profile Form Submission
profilesRouter.post("/edit/:id", ProfileController.EditProfile);

profilesRouter.get("/:id", ProfileController.Detail);
profilesRouter.post("/:id", ProfileController.Comment);

profilesRouter.get("/delete/:id", ProfileController.DeleteProfileById);

module.exports = profilesRouter;