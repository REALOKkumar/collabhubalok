//Activity Logger (backend/models/ActivityLog.js)
//This will keep a timeline of everything happening in the app (e.g., "Harshit created a request," "Sandipan joined a team").

const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  // Who did the action?
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // What did they do? (e.g., "CREATED_POST", "JOINED_TEAM", "SENT_MESSAGE")
  actionType: {
    type: String,
    required: true
  },
  // Details (e.g., "Created a study group for React")
  description: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ActivityLog', ActivitySchema);
