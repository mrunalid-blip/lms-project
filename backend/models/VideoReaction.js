const mongoose = require("mongoose");

const videoReactionSchema = new mongoose.Schema(
  {
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reaction: {
      type: String,
      enum: ["like", "dislike"],
      required: true,
    },
  },
  { timestamps: true }
);

videoReactionSchema.index({ videoId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("VideoReaction", videoReactionSchema);
