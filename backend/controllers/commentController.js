const Comment = require("../models/Comment");

exports.createComment = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { text, timestampSeconds } = req.body;

    const comment = await Comment.create({
      videoId,
      userId: req.user.id, // ✅ LOGGED IN USER
      text,
      timestampSeconds: timestampSeconds || 0,
    });

    const populated = await comment.populate("userId", "fullName");

    res.status(201).json({
      success: true,
      comment: populated,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getComments = async (req, res) => {
  try {
    const { videoId } = req.params;

    const comments = await Comment.find({ videoId })
      .populate("userId", "fullName")
      .sort({ createdAt: -1 });

    res.json({ success: true, comments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// DELETE COMMENT (optional)
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findOneAndDelete({
      _id: commentId,
      userId: req.user.id,
    });

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
