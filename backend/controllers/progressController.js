const Progress = require('../models/Progress');
const Video = require('../models/Video');

// Update user's watch progress
exports.updateProgress = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { lastPosition, completed } = req.body;

    // Check if video exists
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Update or create progress
    let progress = await Progress.findOne({
      userId: req.userId,
      videoId
    });

    if (progress) {
      progress.lastPosition = lastPosition;
      progress.completed = completed || false;
      progress.lastAccessed = new Date();
    } else {
      progress = new Progress({
        userId: req.userId,
        videoId,
        lastPosition,
        completed: completed || false
      });
    }

    await progress.save();

    res.json({
      success: true,
      message: 'Progress updated',
      progress
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user's progress for a video
exports.getProgress = async (req, res) => {
  try {
    const { videoId } = req.params;

    const progress = await Progress.findOne({
      userId: req.userId,
      videoId
    });

    res.json({
      success: true,
      progress: progress || { lastPosition: 0, completed: false }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all user's progress
exports.getAllProgress = async (req, res) => {
  try {
    const progressList = await Progress.find({ userId: req.userId })
      .populate('videoId', 'title thumbnailUrl duration')
      .sort({ lastAccessed: -1 });

    res.json({
      success: true,
      progressList
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};