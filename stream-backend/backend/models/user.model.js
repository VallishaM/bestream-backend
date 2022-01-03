const mongoose = require("mongoose")
const Schema = mongoose.Schema

const userSchema = new Schema(
  {
    followers: {
      type: Array,
      required: true,
    },
    nfollowers: {
      type: Number,
      required: true,
    },
    following: {
      type: Array,
      required: true,
    },
    nfollowing: {
      type: Number,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 5,
    },
    firstName: {
      type: String,
      required: true,
      unique: false,
      trim: true,
      minlength: 1,
    },
    lastName: {
      type: String,
      required: true,
      unique: false,
      trim: true,
      minlength: 1,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: 1,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      unique: false,
    },
  },
  {
    timestamps: true,
  }
)
const User = mongoose.model("User", userSchema)
module.exports = User
