const path = require("path");
const UserOps = require("../data/UserOps.js");
const _userOps = new UserOps()

const RequestService = require("../services/RequestService");
//const UserOps = require("../data/UserOps.js");

exports.Index = async function (request, response) {
  let reqInfo = RequestService.reqHelper(request);
  let myId = await _userOps.getIdByUsername(reqInfo.username);
  console.log("loading profiles from controller");
  if(request.query.searchProfile) {
    console.log("search");
    let profiles = await _userOps.getProfileBySearch(request.query.searchProfile, request.query.searchCategory);
    if (profiles) {
      response.render("profile/profiles", {
      title: "Node Yearbook - Profiles",
      profiles: profiles,
      reqInfo: reqInfo,
      myId: myId.user.id
    });
    } else {
      response.render("profile/profiles", {
        title: "Node Yearbook - Profiles",
        profiles: [],
        reqInfo: reqInfo,
        myId: myId.user.id
      });
    }
  } else {
    let profiles = await _userOps.getAllProfiles();
    if (profiles) {
      response.render("profile/profiles", {
      title: "Node Yearbook - Profiles",
      profiles: profiles,
      reqInfo: reqInfo,
      myId: myId.user.id
    });
    } else {
      response.render("profile/profiles", {
        title: "Node Yearbook - Profiles",
        profiles: [],
        reqInfo: reqInfo,
        myId: myId.user.id
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
    response.render("profile/profile", {
      title: "Node Yearbook - " + profile.firstName + " " + profile.lastName,
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
    response.render("profile/profiles", {
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
    response.render("profile/profile", {
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
    response.render("profile/profiles", {
      title: "Express Yourself - Profiles",
      profiles: [],
      reqInfo: reqInfo
    });
  }
};
// Handle profile form GET request
exports.Create = async function (request, response) {
  let reqInfo = RequestService.reqHelper(request);
  response.render("profile/profile-form", {
    title: "Create Profile",
    errorMessage: "",
    profile_id: null,
    profile: {},
    reqInfo: reqInfo
  });
};

// Handle profile form GET request
exports.DeleteProfileById = async function (request, response) {
  let reqInfo = RequestService.reqHelper(request);
  const profileId = request.params.id;
  console.log(`deleting single profile by id ${profileId}`);
  let deletedProfile = await _userOps.deleteProfileById(profileId);
  let profiles = await _userOps.getAllProfiles();

  if (deletedProfile) {
    response.render("profile/profiles", {
      title: "Express Yourself - Profiles",
      profiles: profiles,
      reqInfo: reqInfo
    });
  } else {
    response.render("profile/profiles", {
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
  response.render("profile/profile-form", {
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
    const profileId = request.body.profile_id;
    const profile = await _userOps.getProfileById(profileId);
    let imagePath = request.body.profilePic ? request.body.profilePic : profile.imagePath;
   if(request.files) {
    const { picture } = request.files;
    //let imagePath = request.body.profilePic || "";
    if (picture) {
      imagePath = `/images/${picture.name}`;
      const serverPath = path.join(__dirname, "../public", imagePath);
      picture.mv(serverPath);
    }
  }

    //const profileId = request.body.profile_id;
    //const profile = await _userOps.getProfileById(profileId);
    console.log("PROFILE", profile);
    const profileName = request.body.name ? request.body.name : profile.username;
    const profileFirstName = request.body.firstname ? request.body.firstname : profile.firstName;
    const profileLastName = request.body.lastname ? request.body.lastname : profile.lastName;
    let profileInterests = [];
    if (request.body.interests) {
      profileInterests = request.body.interests.split(", ");
    } else {
      profileInterests = profile.interests;
    }
    console.log("ROLES", request.body.roles);
    const profileRoles = request.body.roles ? request.body.roles : profile.roles;
    const email = request.body.email ? request.body.email : profile.email;
  
    let responseObj = await _userOps.updateProfileById(profileId, profileName, profileFirstName, profileLastName, email, profileInterests, imagePath, profileRoles);
  
    // if no errors, save was successful
    if (responseObj.errorMsg == "") {
      let profiles = await _userOps.getAllProfiles();
      response.render("profile/profile", {
        title: "Express Yourself - " + responseObj.obj.username,
        profiles: profiles,
        profileId: responseObj.obj._id.valueOf(),
        profileName: responseObj.obj.username,
        profileFirstName: responseObj.obj.firstName,
        profileLastName: responseObj.obj.lastName,
        profileEmail: responseObj.obj.email,
        profileComment: responseObj.obj.comments,
        profileImagePath: imagePath,
        layout: "./layouts/sidebar",
        profileInterests: profileInterests,
        reqInfo: reqInfo
      });
    }
    // There are errors. Show form the again with an error message.
    else {
      console.log("An error occured. Item not created.");
      response.render("profile/profile-form", {
        title: "Edit Profile",
        profile: responseObj.obj,
        profileId: profileId,
        reqInfo: reqInfo
      });
    }
  };


