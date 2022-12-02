const User = require("../models/User");

class UserOps {
  // Constructor
  UserOps() {}

  async getUserByEmail(email) {
    let user = await User.findOne({ email: email });
    if (user) {
      const response = { obj: user, errorMessage: "" };
      return response;
    } else {
      return null;
    }
  }

  async getUserByUsername(username) {
    let user = await User.findOne(
      { username: username },
      { _id: 0, username: 1, email: 1, firstName: 1, lastName: 1 }
    );
    if (user) {
      const response = { user: user, errorMessage: "" };
      return response;
    } else {
      return null;
    }
  }

  async getRolesByUsername(username) {
    let user = await User.findOne({ username: username }, { _id: 0, roles: 1 });
    if (user.roles) {
      return user.roles;
    } else {
      return [];
    }
  }

  async getAllProfiles() {
    console.log("getting all profiles");
    let profiles = await User.find().sort({ username: 1 });
    return profiles;
  }

  async getProfileById(id) {
    console.log(`getting profile by id ${id}`);
    let profile = await User.findById(id);
    return profile;
  }

  async getProfileBySearch(search, searchCategory) {
    console.log(`getting profile by search ${search}`);
    let profiles;
    if(searchCategory === "firstName"){
      profiles = await User.find({ firstName: {"$regex" :search, "$options":"i"} }).sort( {username: 1} );
    } else if(searchCategory === "lastName"){
      profiles = await User.find({ lastName: {"$regex" :search, "$options":"i"} }).sort( {username: 1} );
    } else if(searchCategory === "email"){
      profiles = await User.find({ email: {"$regex" :search, "$options":"i"} }).sort( {username: 1} );
    } else {
      profiles = await User.find({ username: {"$regex" :search, "$options":"i"} }).sort( {username: 1} );
    }
    return profiles;
  }

  /*async createProfile(profileObj) {
    try {
      const error = await profileObj.validateSync();
      if (error) {
        const response = {
          obj: profileObj,
          errorMsg: error.message,
        };
        return response; // Exit if the model is invalid
      }

      // Model is valid, so save it
      const result = await profileObj.save();
      const response = {
        obj: result,
        errorMsg: "",
      };
      return response;
    } catch (error) {
      const response = {
        obj: profileObj,
        errorMsg: error.message,
      };
      return response;
    }
  }*/

  async deleteProfileById(id) {
    console.log(`deleting profile by id ${id}`);
    let result = await User.findByIdAndDelete(id);
    console.log(result);
    return result;
  }

  async updateProfileById(id, profileName) {
    console.log(`updating profile by id ${id}`);
    const profile = await User.findById(id);
    console.log("original profile: ", profile);
    profile.firstName = profileName;

    let result = await profile.save();
    console.log("updated profile: ", result);
    return {
      obj: result,
      errorMsg: "",
    };
  }
}

module.exports = UserOps;