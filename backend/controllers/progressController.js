const Progress = require('../models/Progress');
const Video = require('../models/Video');

exports.updateProgress = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { lastPosition } = req.body;

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    let progress = await Progress.findOne({
      userId: req.user.id,
      videoId,
    });

    if (!progress) {
      progress = new Progress({
        userId: req.user.id,
        videoId,
        lastPosition: 0,
        completed: false,
      });
    }

    const safeIncoming = Math.floor(lastPosition);

    // 🔐 Allow only small forward jumps (anti cheat)
    const allowedJump = 30; // seconds

    if (safeIncoming > progress.lastPosition + allowedJump) {
      return res.status(400).json({
        error: "Progress jump too large",
      });
    }

    // Never allow backward overwrite
    progress.lastPosition = Math.max(
      progress.lastPosition,
      safeIncoming
    );

    progress.lastAccessed = new Date();

    await progress.save();

    res.json({
      success: true,
      progress: {
        lastPosition: progress.lastPosition,
        completed: progress.completed,
        lastAccessed: progress.lastAccessed,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ✅ Get progress for one video
exports.getProgress = async (req, res) => {
  try {
    const { videoId } = req.params;

    const progress = await Progress.findOne({
      userId: req.user.id,
      videoId
    });

    res.json({
      success: true,
      progress: progress || {
        lastPosition: 0,
        completed: false
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get all progress of logged-in user
exports.getAllProgress = async (req, res) => {
  try {
    const progressList = await Progress.find({
      userId: req.user.id
    })
      .populate('videoId', 'title duration forceWatch courseUuid')

      .sort({ lastAccessed: -1 });

    res.json({ success: true, progressList });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
