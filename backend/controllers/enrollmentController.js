const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

exports.enrollCourse = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ error: 'courseId is required' });
    }

    const course = await Course.findOne({ uuid: courseId });
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const existing = await Enrollment.findOne({
      userId: req.user.id,
      courseId: course._id
    });

    if (existing) {
      return res.status(400).json({ error: 'Already enrolled in this course' });
    }

    const enrollment = await Enrollment.create({
      userId: req.user.id,
      courseId: course._id
    });

    res.status(201).json({
      success: true,
      message: 'Course enrolled successfully',
      enrollment
    });
  } catch (error) {
    console.error('Enroll error:', error);
    res.status(500).json({ error: error.message });
  }
};



exports.getMyEnrollments = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const enrollments = await Enrollment.find({
      userId: req.user.id
    }).populate('courseId', 'uuid course_name thumbnail_web duration');

    res.json({ success: true, enrollments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

