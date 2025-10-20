const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ["resident", "admin"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
