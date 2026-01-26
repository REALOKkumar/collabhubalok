const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  // This 'user' field links this post to a specific document in the 'users' collection
  user: {
    type: mongoose.Schema.Types.ObjectId, // We store the MongoDB _id here
    ref: 'User',                          // This tells Mongoose it refers to the 'User' model
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Post', PostSchema);