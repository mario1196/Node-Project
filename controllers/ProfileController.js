const Profile = require("../models/Profile.js");

const ProfileOps = require("../data/ProfileOps");
const UserOps = require("../data/UserOps.js");
// instantiate the class so we can use its methods
const _profileOps = new ProfileOps();
const _userOps = new UserOps()

const RequestService = require("../services/RequestService");
//const UserOps = require("../data/UserOps.js");

exports.Index = async function (request, response) {
  let reqInfo = RequestService.reqHelper(request);
  console.log("loading profiles from controller");

  ///david added in this information////
  if (reqInfo.authenticated) {
    let roles = await _userOps.getRolesByUsername(reqInfo.username);
    let sessionData = req.session;
    sessionData.roles = roles;
    reqInfo.roles = roles;
    let userInfo = await _userOps.getUserByUsername(reqInfo.username);
    if(request.query.searchProfile) {
    console.log("search");
    let profiles = await _userOps.getProfileBySearch(request.query.searchProfile, request.query.searchCategory);
    if (profiles) {
      response.render("profiles", {
      title: "Express Yourself - Profiles",
      profiles: profiles,
      reqInfo: reqInfo
    });
    }
    if (request.body.searchProfile) {
      console.log("search");
      let profiles = await _userOps.getProfileBySearch(request.body.searchProfile);
      if (profiles) {
        response.render("profiles", {
          title: "Express Yourself - Profiles",
          profiles: profiles,
          reqInfo: reqInfo,
          userInfo: userInfo
        });
      } else {
        response.render("profiles", {
          title: "Express Yourself - Profiles",
          profiles: [],
          reqInfo: reqInfo
        });
      }
    } else {
      let profiles = await _userOps.getAllProfiles();
      if (profiles) {
        response.render("profiles", {
          title: "Express Yourself - Profiles",
          profiles: profiles,
          reqInfo: reqInfo
        });
      } else {
        response.render("profiles", {
          title: "Express Yourself - Profiles",
          profiles: [],
          reqInfo: reqInfo
        });
      }
    }
    // return res.render("user/profile", {
    //   reqInfo: reqInfo,
    //   userInfo: userInfo,
    // });
  } else {
    response.redirect(
      // "/user/login?errorMessage=You must be logged in to view this page."
      "https://www.youtube.com/watch?v=oHg5SJYRHA0"
    );
  };
}

exports.Detail = async function (request, response) {
  let reqInfo = RequestService.reqHelper(request);
  const profileId = request.params.id;
  console.log(`loading single profile by id ${profileId}`);
  let profile = await _userOps.getProfileById(profileId);
  let profiles = await _userOps.getAllProfiles();
  if (profile) {
    response.render("profile", {
      title: "Express Yourself - " + profile.name,
      profiles: profiles,
      profileId: request.params.id,
      profileName: profile.username,
      layout: "./layouts/sidebar",
      reqInfo: reqInfo
    });
  } else {
    response.render("profiles", {
      title: "Express Yourself - Profiles",
      profiles: [],
      reqInfo: reqInfo
    });
  }
};

// Handle profile form GET request
exports.Create = async function (request, response) {
  let reqInfo = RequestService.reqHelper(request);
  response.render("profile-form", {
    title: "Create Profile",
    errorMessage: "",
    profile_id: null,
    profile: {},
    reqInfo: reqInfo
  });
};

exports.Search = async function (request, response) {
  let reqInfo = RequestService.reqHelper(request);
  console.log("Search");
  let profiles = await _profileOps.search(id);
  if (profiles) {
    response.render("profiles", {
      title: "Express Yourself - Profiles",
      profiles: profiles,
      reqInfo: reqInfo
    });
  } else {
    response.render("profiles", {
      title: "Express Yourself - Profiles",
      profiles: [],
      reqInfo: reqInfo
    });
  }
};

// Handle profile form GET request
exports.CreateProfile = async function (request, response) {
  let reqInfo = RequestService.reqHelper(request);
  // instantiate a new Profile Object populated with form data
  let tempProfileObj = new Profile({
    name: request.body.name,
  });

  //
  let responseObj = await _profileOps.createProfile(tempProfileObj);

  // if no errors, save was successful
  if (responseObj.errorMsg == "") {
    let profiles = await _profileOps.getAllProfiles();
    console.log(responseObj.obj);
    response.render("profile", {
      title: "Express Yourself - " + responseObj.obj.name,
      profiles: profiles,
      profileId: responseObj.obj._id.valueOf(),
      profileName: responseObj.obj.name,
      layout: "./layouts/sidebar",
      reqInfo: reqInfo
    });
  }
  // There are errors. Show form the again with an error message.
  else {
    console.log("An error occured. Item not created.");
    response.render("profile-form", {
      title: "Create Profile",
      profile: responseObj.obj,
      errorMessage: responseObj.errorMsg,
      reqInfo: reqInfo
    });
  }
};

// Handle profile form GET request
exports.DeleteProfileById = async function (request, response) {
  let reqInfo = RequestService.reqHelper(request);
  const profileId = request.params.id;
  console.log(`deleting single profile by id ${profileId}`);
  let deletedProfile = await _userOps.deleteProfileById(profileId);
  let profiles = await _userOps.getAllProfiles();

  if (deletedProfile) {
    response.render("profiles", {
      title: "Express Yourself - Profiles",
      profiles: profiles,
      reqInfo: reqInfo
    });
  } else {
    response.render("profiles", {
      title: "Express Yourself - Profiles",
      profiles: profiles,
      errorMessage: "Error.  Unable to Delete",
      reqInfo: reqInfo
    });
  }
};

// Handle edit profile form GET request
exports.Edit = async function (request, response) {
  let reqInfo = RequestService.reqHelper(request);
  const profileId = request.params.id;
  let profileObj = await _userOps.getProfileById(profileId);
  response.render("profile-form", {
    title: "Edit Profile",
    errorMessage: "",
    profile_id: profileId,
    profile: profileObj,
    reqInfo: reqInfo
  });
};

// Handle profile edit form submission
exports.EditProfile = async function (request, response) {
  let reqInfo = RequestService.reqHelper(request);
  const profileId = request.body.profile_id;
  const profileName = request.body.name;

  // send these to profileOps to update and save the document
  let responseObj = await _userOps.updateProfileById(profileId, profileName);

  // if no errors, save was successful
  if (responseObj.errorMsg == "") {
    let profiles = await _userOps.getAllProfiles();
    response.render("profile", {
      title: "Express Yourself - " + responseObj.obj.username,
      profiles: profiles,
      profileId: responseObj.obj._id.valueOf(),
      profileName: responseObj.obj.username,
      layout: "./layouts/sidebar",
      reqInfo: reqInfo
    });
  }
  // There are errors. Show form the again with an error message.
  else {
    console.log("An error occured. Item not created.");
    response.render("profile-form", {
      title: "Edit Profile",
      profile: responseObj.obj,
      profileId: profileId,
      errorMessage: responseObj.errorMsg,
      reqInfo: reqInfo
    });
  }
};

