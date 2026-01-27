const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const { auth, isAdmin } = require('../middleware/auth');
const upload = require('../config/multer');



/**
 * @swagger
 * tags:
 *   - name: Videos
 *     description: Video management APIs
 */

/**
 * @swagger
 * /api/videos:
 *   get:
 *     tags:
 *       - Videos
 *     summary: Get all videos
 *     responses:
 *       200:
 *         description: List of videos
 */
router.get('/', videoController.getAllVideos);

/**
 * Upload video file (Admin only)
 */
/**
 * @swagger
 * /api/videos/upload:
 *   post:
 *     tags:
 *       - Videos
 *     summary: Upload video file (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - video
 *               - title
 *               - courseUuid
 *             properties:
 *               video:
 *                 type: string
 *                 format: binary
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               courseUuid:
 *                 type: string
 *               moduleTitle:
 *                 type: string
 *               lessonNumber:
 *                 type: number
 *     responses:
 *       201:
 *         description: Video uploaded successfully
 */

router.post(
  '/upload',
  auth,
  isAdmin,
  upload.single('video'),
  videoController.uploadVideo
);


/**
 * @swagger
 * /api/videos/{id}:
 *   get:
 *     tags:
 *       - Videos
 *     summary: Get video by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Video details
 */
router.get('/:id', auth, videoController.getVideoById);

/**
 * @swagger
 * /api/videos:
 *   post:
 *     tags:
 *       - Videos
 *     summary: Create a new video (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - videoUrl
 *             properties:
 *               title:
 *                 type: string
 *                 example: Introduction to Oncology
 *               description:
 *                 type: string
 *                 example: Overview of the course
 *               videoUrl:
 *                 type: string
 *                 example: https://cdn.example.com/video.mp4
 *               thumbnailUrl:
 *                 type: string
 *                 example: https://cdn.example.com/thumb.jpg
 *               duration:
 *                 type: number
 *                 example: 600
 *               allowDownload:
 *                 type: boolean
 *                 example: false
 *               forceWatch:
 *                 type: boolean
 *                 example: false
 *               enableForum:
 *                 type: boolean
 *                 example: true
 *               enableRatings:
 *                 type: boolean
 *                 example: true
 *               enableResolution:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Video created successfully
 */
router.post('/', auth, isAdmin, videoController.createVideo);


/**
 * @swagger
 * /api/videos/{id}:
 *   put:
 *     tags:
 *       - Videos
 *     summary: Update video (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Video updated
 */
router.put(
  '/:id',
  auth,
  isAdmin,
  upload.single('video'), // 👈 REQUIRED
  videoController.updateVideo
);


/**
 * @swagger
 * /api/videos/{id}:
 *   delete:
 *     tags:
 *       - Videos
 *     summary: Delete video (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Video deleted
 */
router.delete('/:id', auth, isAdmin, videoController.deleteVideo);

/**
 * @swagger
 * /api/videos/{id}/generate-transcript:
 *   post:
 *     tags:
 *       - Videos
 *     summary: Generate transcript for video (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Transcript generated
 */
router.post('/:id/generate-transcript', auth, isAdmin, videoController.generateTranscript);

module.exports = router;
