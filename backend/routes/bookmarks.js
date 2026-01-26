const express = require('express');
const router = express.Router();
const bookmarkController = require('../controllers/bookmarkController');
const { auth } = require('../middleware/auth');

/**
 * @swagger
 * /api/bookmarks/{videoId}:
 *   post:
 *     tags:
 *       - Bookmarks
 *     summary: Create a bookmark for a video
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
 *               - timestampSeconds
 *             properties:
 *               timestampSeconds:
 *                 type: number
 *                 example: 180
 *               label:
 *                 type: string
 *                 example: Important section
 *     responses:
 *       201:
 *         description: Bookmark created successfully
 */
router.post('/:videoId', auth, bookmarkController.createBookmark);


/**
 * @swagger
 * /api/bookmarks/{videoId}:
 *   get:
 *     tags:
 *       - Bookmarks
 *     summary: Get bookmarks for a video
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *     responses:
 *       200:
 *         description: List of bookmarks
 */
router.get('/:videoId', auth, bookmarkController.getBookmarks);

/**
 * @swagger
 * /api/bookmarks/{bookmarkId}:
 *   delete:
 *     tags:
 *       - Bookmarks
 *     summary: Delete a bookmark
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookmarkId
 *         required: true
 *     responses:
 *       200:
 *         description: Bookmark deleted
 */
router.delete('/:bookmarkId', auth, bookmarkController.deleteBookmark);

module.exports = router;
