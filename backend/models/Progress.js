const mongoose = require('mongoose');
const progressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
    lastPosition: {
      type: Number,
      default: 0,
    },
    maxPosition: {
      type: Number,
      default: 0,
    },
    watchedDuration: {
      type: Number,
      default: 0,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

progressSchema.index({ userId: 1, videoId: 1 }, { unique: true });

module.exports = mongoose.model("Progress", progressSchema);
