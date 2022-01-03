const mongoose = require("mongoose")
const Schema = mongoose.Schema

const tokenSchema = new Schema(
  {
    token: {
      type: String,
      required: true,
      unique: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
)
const Token = mongoose.model("Token", tokenSchema)
module.exports = Token
