const VideoReaction = require("../models/VideoReaction");

/**
 * PUBLIC
 */
const getReactionCounts = async (req, res) => {
  try {
    const { videoId } = req.params;

    const [likes, dislikes] = await Promise.all([
      VideoReaction.countDocuments({ videoId, reaction: "like" }),
      VideoReaction.countDocuments({ videoId, reaction: "dislike" }),
    ]);

    res.json({ likes, dislikes });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reactions" });
  }
};

/**
 * PRIVATE
 */
const getMyReaction = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user.id;

    const reaction = await VideoReaction.findOne({ videoId, userId });
    res.json({ reaction: reaction?.reaction || null });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user reaction" });
  }
};

/**
 * PRIVATE
 */
const reactToVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { reaction } = req.body;
    const userId = req.user.id;

    if (!["like", "dislike"].includes(reaction)) {
      return res.status(400).json({ message: "Invalid reaction" });
    }

    const existing = await VideoReaction.findOne({ videoId, userId });

    if (existing && existing.reaction === reaction) {
      await existing.deleteOne();
      return res.json({ reaction: null });
    }

    if (existing) {
      existing.reaction = reaction;
      await existing.save();
      return res.json({ reaction });
    }

    await VideoReaction.create({ videoId, userId, reaction });
    res.status(201).json({ reaction });
  } catch (error) {
    res.status(500).json({ message: "Failed to update reaction" });
  }
};

module.exports = {
  getReactionCounts,
  getMyReaction,
  reactToVideo,
};
