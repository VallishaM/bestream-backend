const mongoose = require("mongoose")
const Schema = mongoose.Schema

const otpSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 5,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
    },
  },
  {
    timestamps: true,
  }
)
const OTP = mongoose.model("OTP", otpSchema)
module.exports = OTP
