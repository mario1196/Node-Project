const mongoose = require("mongoose");
const passportLocalmongoose = require("passport-local-mongoose");

const commentSchema = mongoose.Schema({
  commentAuthor: String,
  commentBody: String,
});

// User Schema
const userSchema = mongoose.Schema({
  username: {
    type: String,
    index: true,
  },
  email: {
    type: String,
    index: true,
  },
  password: {
    type: String,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  roles: {
    type: Array,
  },
  interests: {
    type: Array
  },
  imagePath: {
    type: String
  },
  comments: [commentSchema]
});

userSchema.plugin(passportLocalmongoose);

// Pass the Schema into Mongoose to use as our model
const User = mongoose.model("User", userSchema);
// Comment Schema

// Export it so that we can use this model in our App
module.exports = User;