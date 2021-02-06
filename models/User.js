const mongoose = require("mongoose");
const Schema = new mongoose.Schema({
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
  isOnline: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("User", Schema);
