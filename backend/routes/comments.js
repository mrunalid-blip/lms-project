const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const { auth } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   - name: Comments
 *     description: Video comments APIs
 */

/**
 * @swagger
 * /api/comments/{videoId}:
 *   post:
 *     tags:
 *       - Comments
 *     summary: Create a comment for a video
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *         description: Video ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 example: This explanation was really helpful!
 *     responses:
 *       201:
 *         description: Comment created successfully
 */
router.post("/:videoId", auth, commentController.createComment);

/**
 * @swagger
 * /api/comments/{videoId}:
 *   get:
 *     tags:
 *       - Comments
 *     summary: Get all comments for a video
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *         description: Video ID
 *     responses:
 *       200:
 *         description: List of comments
 */
router.get("/:videoId", auth, commentController.getComments);

/**
 * @swagger
 * /api/comments/{commentId}:
 *   delete:
 *     tags:
 *       - Comments
 *     summary: Delete a comment (own comment only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       404:
 *         description: Comment not found
 */
router.delete("/:commentId", auth, commentController.deleteComment);

module.exports = router;
