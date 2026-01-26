const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { auth } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   - name: Progress
 *     description: Video progress tracking APIs
 */

/**
 * @swagger
 * /api/progress/{videoId}:
 *   post:
 *     tags:
 *       - Progress
 *     summary: Update watch progress for a video
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lastPosition
 *             properties:
 *               lastPosition:
 *                 type: number
 *                 example: 120
 *               completed:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Progress updated successfully
 */
router.post('/:videoId', auth, progressController.updateProgress);


/**
 * @swagger
 * /api/progress/{videoId}:
 *   get:
 *     tags:
 *       - Progress
 *     summary: Get progress for a video
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *     responses:
 *       200:
 *         description: Video progress
 */
router.get('/:videoId', auth, progressController.getProgress);

/**
 * @swagger
 * /api/progress:
 *   get:
 *     tags:
 *       - Progress
 *     summary: Get all progress for logged-in user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All progress records
 */
router.get('/', auth, progressController.getAllProgress);

module.exports = router;
