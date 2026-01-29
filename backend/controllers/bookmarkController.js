const Bookmark = require('../models/Bookmark');

// Create bookmark
exports.createBookmark = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { timestampSeconds, label } = req.body;

    if (timestampSeconds === undefined) {
      return res.status(400).json({ error: 'Timestamp is required' });
    }

    const bookmark = new Bookmark({
      userId: req.user.id,
      videoId,
      timestampSeconds,
      label: label || ''
    });

    await bookmark.save();

    res.status(201).json({
      success: true,
      message: 'Bookmark created',
      bookmark
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get bookmarks for a video
exports.getBookmarks = async (req, res) => {
  try {
    const { videoId } = req.params;

    const bookmarks = await Bookmark.find({
      userId: req.user.id,
      videoId
    }).sort({ timestampSeconds: 1 });

    res.json({
      success: true,
      bookmarks
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete bookmark
exports.deleteBookmark = async (req, res) => {
  try {
    const { bookmarkId } = req.params;

    const bookmark = await Bookmark.findOneAndDelete({
      _id: bookmarkId,
      userId: req.user.id
    });

    if (!bookmark) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }

    res.json({
      success: true,
      message: 'Bookmark deleted'
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};