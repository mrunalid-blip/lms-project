const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  videoUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
// Link to Course
courseUuid: {
  type: String,
  required: true,
  index: true,
},

  
  // Module/Chapter organization
  moduleTitle: {
    type: String
  },
  chapterTitle: {
    type: String
  },
  lessonNumber: {
    type: Number,
    default: 1
  },
  
  // Admin Settings
  allowDownload: {
    type: Boolean,
    default: false
  },
  forceWatch: {
    type: Boolean,
    default: false
  },
  enableForum: {
    type: Boolean,
    default: true
  },
  enableRatings: {
    type: Boolean,
    default: true
  },
  enableResolution: {
    type: Boolean,
    default: true
  },
  
  transcriptUrl: {
    type: String
  },
  status: {
    type: String,
    enum: ['processing', 'ready', 'failed'],
    default: 'processing'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Video', videoSchema);