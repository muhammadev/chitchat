const mongoose = require("mongoose");
const messageSchema = mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  sender: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
  },
  receiver: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
  },
  seen: {
    type: Boolean,
    default: false,
  },
  sentAt: {
    type: Date
  }
})