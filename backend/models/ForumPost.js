const mongoose = require('mongoose');

const forumPostSchema = new mongoose.Schema({
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parentPostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumPost',
    default: null // null means it's a parent post, not a reply
  },
  postText: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ForumPost', forumPostSchema);