const Profile = require("../models/Profile.js");
const path = require("path");
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
  if(request.query.searchProfile) {
    console.log("search");
    let profiles = await _userOps.getProfileBySearch(request.query.searchProfile, request.query.searchCategory);
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
};

exports.Detail = async function (request, response) {
  let reqInfo = RequestService.reqHelper(request);
  let roles = await _userOps.getRolesByUsername(reqInfo.username);
  let sessionData = request.session;
  sessionData.roles = roles;
  reqInfo.roles = roles;
  const profileId = request.params.id;
  console.log(`loading single profile by id ${profileId}`);
  let profile = await _userOps.getProfileById(profileId);
  let profiles = await _userOps.getAllProfiles();
  console.log(`images:: ${profile.imagePath}`);
  console.log(`images:: ${profile.interests}`);
  if (profile) {
    response.render("profile", {
      title: "Express Yourself - " + profile.username,
      profiles: profiles,
      profileId: request.params.id,
      profileName: profile.username,
      profileFirstName: profile.firstName,
      profileLastName: profile.lastName,
      profileImagePath: profile.imagePath,
      profileInterests: profile.interests,
      profileEmail: profile.email,
      profileComment: profile.comments,
      profileEmail: profile.email,
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

exports.Comment = async function (request, response) {
  let reqInfo = RequestService.reqHelper(request);

  const comment = {
    commentBody: request.body.comments,
    commentAuthor: reqInfo.username,
  };
  let profileInfo = await _userOps.addCommentToUser(
    comment,
    request.params.id
  );

  const profileId = request.params.id;
  console.log(`loading single profile by id ${profileId}`);
  let profile = await _userOps.getProfileById(profileId);
  let profiles = await _userOps.getAllProfiles();
  if (profile) {
    response.render("profile", {
      title: "Express Yourself - " + profile.username,
      profiles: profiles,
      profileId: request.params.id,
      profileName: profile.username,
      profileFirstName: profile.firstName,
      profileLastName: profile.lastName,
      profileImagePath: profile.imagePath,
      profileInterests: profile.interests,
      profileEmail: profile.email,
      profileComment: profile.comments,
      profileCommentBody: profileInfo.commentBody,
      profileCommentAuthor: profileInfo.commentAuthor,
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
    /*
    let picture;
    if (request.files) {
      console.log(request.files);
      picture = request.files;
    } else {
      console.log("it is empty");
    }
    */
    const { picture } = request.files;
    let imagePath = request.body.profilePic || "";
    if (picture) {
      imagePath = `/images/${picture.name}`;
      const serverPath = path.join(__dirname, "../public", imagePath);
      picture.mv(serverPath);
    }

    const profileId = request.body.profile_id;
    const profileName = request.body.name;
    const profileFirstName = request.body.firstname;
    const profileLastName = request.body.lastname;
    let profileInterests = [];
    if (request.body.interests) {
      profileInterests = request.body.interests.split(", ");
    }
    console.log("ROLES", request.body.roles);
    const profileRoles = request.body.roles;
    const email = request.body.email;
  
    // send these to profileOps to update and save the document
    let responseObj = await _userOps.updateProfileById(profileId, profileName, profileFirstName, profileLastName, email, profileInterests, imagePath, profileRoles);
  
    // if no errors, save was successful
    if (responseObj.errorMsg == "") {
      let profiles = await _userOps.getAllProfiles();
      response.render("profile", {
        title: "Express Yourself - " + responseObj.obj.username,
        profiles: profiles,
        profileId: responseObj.obj._id.valueOf(),
        profileName: responseObj.obj.username,
        profileFirstName: responseObj.obj.firstName,
        profileLastName: responseObj.obj.lastName,
        profileEmail: responseObj.obj.email,
        profileComment: responseObj.obj.comments,
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
        reqInfo: reqInfo
      });
    }
  };


