const Note = require('../models/Note');

// Create a note
exports.createNote = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { timestampSeconds, noteText } = req.body;

    if (!noteText || timestampSeconds === undefined) {
      return res.status(400).json({ error: 'Timestamp and note text are required' });
    }

    const note = new Note({
      userId: req.userId,
      videoId,
      timestampSeconds,
      noteText
    });

    await note.save();

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      note
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all notes for a video
exports.getNotes = async (req, res) => {
  try {
    const { videoId } = req.params;

    const notes = await Note.find({
      userId: req.userId,
      videoId
    }).sort({ timestampSeconds: 1 });

    res.json({
      success: true,
      notes
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a note
exports.updateNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { noteText } = req.body;

    const note = await Note.findOneAndUpdate(
      { _id: noteId, userId: req.userId },
      { noteText },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({
      success: true,
      message: 'Note updated',
      note
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a note
exports.deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;

    const note = await Note.findOneAndDelete({
      _id: noteId,
      userId: req.userId
    });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({
      success: true,
      message: 'Note deleted'
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};