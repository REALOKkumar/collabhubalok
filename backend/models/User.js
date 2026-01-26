const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // This is the CRITICAL link
  firebaseUid: { 
    type: String, 
    required: true, 
    unique: true 
  },
  email: { 
    type: String, 
    required: true 
  },
  username: { 
    type: String 
  },
  // Add any other profile data you want to store
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('User', UserSchema);