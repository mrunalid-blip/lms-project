const Video = require('../models/Video');
const Progress = require('../models/Progress');

// Admin: Create/Upload video
exports.createVideo = async (req, res) => {
  try {
    const {
      title,
      description,
      videoUrl,
      thumbnailUrl,
      duration,
      allowDownload,
      forceWatch,
      enableForum,
      enableRatings,
      enableResolution
    } = req.body;

    // Validate
    if (!title || !videoUrl) {
      return res.status(400).json({ error: 'Title and video URL are required' });
    }

    const video = new Video({
      title,
      description,
      videoUrl,
      thumbnailUrl,
      duration,
      uploadedBy: req.userId,
      allowDownload: allowDownload || false,
      forceWatch: forceWatch || false,
      enableForum: enableForum !== false, // default true
      enableRatings: enableRatings !== false,
      enableResolution: enableResolution !== false,
      status: 'ready'
    });

    await video.save();

    res.status(201).json({
      success: true,
      message: 'Video created successfully',
      video
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateVideo = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    // Update text fields
    if (req.body.title !== undefined) video.title = req.body.title;
    if (req.body.description !== undefined) video.description = req.body.description;
    if (req.body.moduleTitle !== undefined) video.moduleTitle = req.body.moduleTitle;
    if (req.body.lessonNumber !== undefined) video.lessonNumber = req.body.lessonNumber;

    // Replace video file ONLY if new file is uploaded
    if (req.file) {
      video.videoUrl = `http://localhost:5000/uploads/videos/${req.file.filename}`;
      video.status = "ready";
    }

    await video.save();

    res.json({
      success: true,
      message: "Video updated successfully",
      video,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Admin: Delete video
exports.deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findByIdAndDelete(id);

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    res.json({
      success: true,
      message: 'Video deleted successfully'
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllVideos = async (req, res) => {
  try {
    const { courseUuid } = req.query;

    const filter = { status: "ready" };
    if (courseUuid) {
      filter.courseUuid = courseUuid;
    }

    const videos = await Video.find(filter)
      .sort({ moduleTitle: 1, lessonNumber: 1 });

    res.json({
      success: true,
      videos,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Get single video with user's progress
exports.getVideoById = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findById(id)
      .populate('uploadedBy', 'fullName email');

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Get user's progress if authenticated
    let progress = null;
    if (req.userId) {
      progress = await Progress.findOne({
        userId: req.userId,
        videoId: id
      });
    }

    res.json({
      success: true,
      video,
      progress
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin: Generate transcript (placeholder for AI integration)
exports.generateTranscript = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // TODO: Integrate with AI service (OpenAI Whisper, NotebookLM, etc.)
    // For now, just return a placeholder response

    res.json({
      success: true,
      message: 'Transcript generation started. This will be processed in the background.',
      status: 'processing'
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const Course = require('../models/Course');

exports.uploadVideo = async (req, res) => {
  try {
    const { title, description, courseUuid, moduleTitle, lessonNumber } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "Video file is required" });
    }

    const course = await Course.findOne({ uuid: courseUuid });
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

 const video = new Video({
  title,
  description,
  videoUrl: `http://localhost:5000/uploads/videos/${req.file.filename}`,


  // ✅ THIS LINKS VIDEO TO COURSE
  courseUuid: course.uuid,
  courseName: course.course_name,

  moduleTitle,
  lessonNumber,
  uploadedBy: req.user.id,
  status: "ready",
});


    await video.save();

    res.status(201).json({
      success: true,
      message: "Video uploaded successfully",
      video,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: error.message });
  }
};
