const express = require("express");

const {
  getReactionCounts,
  getMyReaction,
  reactToVideo,
} = require("../controllers/videoReaction.controller");

const { auth } = require("../middleware/auth");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Video Reactions
 *   description: Like / Dislike videos
 */

/**
 * @swagger
 * /api/videos/{videoId}/reaction:
 *   get:
 *     summary: Get like and dislike counts (public)
 *     tags: [Video Reactions]
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *         description: Video ID
 *     responses:
 *       200:
 *         description: Reaction counts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 likes:
 *                   type: number
 *                   example: 10
 *                 dislikes:
 *                   type: number
 *                   example: 2
 */
router.get("/videos/:videoId/reaction", getReactionCounts);

/**
 * @swagger
 * /api/videos/{videoId}/reaction/me:
 *   get:
 *     summary: Get current user's reaction for a video
 *     tags: [Video Reactions]
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
 *         description: User reaction
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reaction:
 *                   type: string
 *                   nullable: true
 *                   enum: [like, dislike]
 *                   example: like
 *       401:
 *         description: Unauthorized
 */
router.get("/videos/:videoId/reaction/me", auth, getMyReaction);

/**
 * @swagger
 * /api/videos/{videoId}/reaction:
 *   post:
 *     summary: Like or dislike a video (toggle)
 *     tags: [Video Reactions]
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
 *               - reaction
 *             properties:
 *               reaction:
 *                 type: string
 *                 enum: [like, dislike]
 *                 example: like
 *     responses:
 *       200:
 *         description: Reaction updated or removed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reaction:
 *                   type: string
 *                   nullable: true
 *                   example: like
 *       201:
 *         description: Reaction created
 *       400:
 *         description: Invalid reaction
 *       401:
 *         description: Unauthorized
 */
router.post("/videos/:videoId/reaction", auth, reactToVideo);

module.exports = router;
