//Chat Messages (backend/models/Message.js)
//This stores the actual conversation history.

const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // If it's a group chat (like for a specific Project ID), store that ID here
  // If it's a global chat, this can be null or "GLOBAL"
  projectId: {
    type: String, 
    default: null
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Message', MessageSchema);
