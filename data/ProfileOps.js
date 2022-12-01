const Profile = require("../models/Profile.js");

class ProfileOps {
  // empty constructor
  ProfileOps() { }

  // DB methods
  async getAllProfiles() {
    console.log("getting all profiles");
    let profiles = await Profile.find().sort({ name: 1 });
    return profiles;
  }

  async getProfileById(id) {
    console.log(`getting profile by id ${id}`);
    let profile = await Profile.findById(id);
    return profile;
  }

  async getProfileBySearch(search) {
    console.log(`getting profile by search ${search}`);
    let profiles = await Profile.find({ name: {"$regex" :search, "$options":"i"} }).sort( {name: 1} );
    return profiles;
  }

  async createProfile(profileObj) {
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
  }
  async deleteProfileById(id) {
    console.log(`deleting profile by id ${id}`);
    let result = await Profile.findByIdAndDelete(id);
    console.log(result);
    return result;
  }

  async updateProfileById(id, profileName) {
    console.log(`updating profile by id ${id}`);
    const profile = await Profile.findById(id);
    console.log("original profile: ", profile);
    profile.name = profileName;

    let result = await profile.save();
    console.log("updated profile: ", result);
    return {
      obj: result,
      errorMsg: "",
    };
  }
}

module.exports = ProfileOps;