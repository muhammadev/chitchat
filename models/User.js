const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const UserSchema = new Schema({
  fullname: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  messages: {
    type: Array,
    default: [],
  },
  online: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("User", UserSchema);
