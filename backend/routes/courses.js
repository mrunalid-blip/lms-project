const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Video = require('../models/Video');

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Course related APIs
 */

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Get all active courses
 *     tags: [Courses]
 *     responses:
 *       200:
 *         description: List of active courses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 courses:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find({ status: 1 })
      .select(
        'uuid course_name one_line_description banner thumbnail_web duration rating rating_count active_learners prices_inr'
      )
      .sort({ created_at: -1 });

    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/courses/{uuid}:
 *   get:
 *     summary: Get course details with videos grouped by modules
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *         description: Course UUID
 *     responses:
 *       200:
 *         description: Course details with videos
 *       404:
 *         description: Course not found
 */
router.get('/:uuid', async (req, res) => {
  try {
    const { uuid } = req.params;

    // 1️⃣ Find course
    const course = await Course.findOne({ uuid });
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    // 2️⃣ Find videos for this course
    const videos = await Video.find({
      status: 'ready',
      $or: [
        { courseUuid: uuid },   // ✅ correct & current
        { courseId: uuid },     // ⚠️ backward compatibility (old data)
      ],
    })
      .select('title description videoUrl moduleTitle lessonNumber duration')
      .sort({ moduleTitle: 1, lessonNumber: 1 });

    // 3️⃣ Group videos by module
    const modules = {};
    videos.forEach((video) => {
      const moduleName = video.moduleTitle || 'General';
      if (!modules[moduleName]) {
        modules[moduleName] = [];
      }
      modules[moduleName].push(video);
    });

    res.json({
      success: true,
      course,
      videos,
      modules,
    });
  } catch (error) {
    console.error('Course API error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
