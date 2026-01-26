//Collaboration Requests (backend/models/CollabRequest.js)
//This tracks when someone clicks "Join" on a post. It needs a Status (Pending/Accepted/Rejected).

const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  sender: { // The person asking to join
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  postId: { // The specific study group/post they want to join
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  message: { // Optional: "Hey, I'm good at React, let me in!"
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CollabRequest', RequestSchema);