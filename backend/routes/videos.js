const express          = require('express');
const router           = express.Router();
const videoController  = require('../controllers/videoController');
const { auth, isAdmin } = require('../middleware/auth');
const upload           = require('../config/multer');

// ─────────────────────────────────────────────────────────────
//  STREAMING ROUTES  (must be declared BEFORE  /:id  catch-all)
// ─────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/videos/stream/{id}/master.m3u8:
 *   get:
 *     tags:
 *       - Videos
 *     summary: Stream HLS master playlist (authenticated)
 *     description: |
 *       Returns the master HLS playlist that references all
 *       available quality levels (360p / 720p / 1080p).
 *       The player uses this to switch quality automatically.
 *       Segment URLs inside the playlist are proxied through
 *       the backend — no direct S3 / filesystem URLs are exposed.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Video ID
 *     responses:
 *       200:
 *         description: HLS master playlist (application/vnd.apple.mpegurl)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Video not found or not ready
 */
router.get(
  '/stream/:id/master.m3u8',
  auth,
  videoController.streamMaster
);

/**
 * @swagger
 * /api/videos/stream/{id}/{quality}/index.m3u8:
 *   get:
 *     tags:
 *       - Videos
 *     summary: Stream quality-specific HLS segment playlist (authenticated)
 *     description: |
 *       Returns the segment playlist for a specific quality rendition.
 *       `quality` must be one of: 360p, 720p, 1080p.
 *       Segment URLs inside are rewritten to proxy through the backend.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Video ID
 *       - in: path
 *         name: quality
 *         required: true
 *         schema:
 *           type: string
 *           enum: [360p, 720p, 1080p]
 *         description: Quality level
 *     responses:
 *       200:
 *         description: HLS segment playlist
 *       400:
 *         description: Invalid quality level
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Playlist not found
 */
router.get(
  '/stream/:id/:quality/index.m3u8',
  auth,
  videoController.streamQualityPlaylist
);

/**
 * @swagger
 * /api/videos/stream/{id}/{quality}/{segment}:
 *   get:
 *     tags:
 *       - Videos
 *     summary: Stream a single HLS video chunk (authenticated)
 *     description: |
 *       Serves an individual .ts segment for the given video and quality.
 *       Authentication is enforced — unauthenticated users receive 401.
 *       Segment name is validated server-side (must match index\d+\.ts)
 *       to prevent path traversal attacks.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Video ID
 *       - in: path
 *         name: quality
 *         required: true
 *         schema:
 *           type: string
 *           enum: [360p, 720p, 1080p]
 *         description: Quality level
 *       - in: path
 *         name: segment
 *         required: true
 *         schema:
 *           type: string
 *           example: index0.ts
 *         description: Segment filename (e.g. index0.ts)
 *     responses:
 *       200:
 *         description: video/MP2T chunk
 *       400:
 *         description: Invalid quality or segment name
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Segment not found
 */
router.get(
  '/stream/:id/:quality/:segment',
  auth,
  videoController.streamSegment
);

// ─────────────────────────────────────────────────────────────
//  STATIC / COLLECTION ROUTES
// ─────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/videos:
 *   get:
 *     tags:
 *       - Videos
 *     summary: Get all ready videos (optionally filter by courseUuid)
 *     parameters:
 *       - in: query
 *         name: courseUuid
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter videos by course UUID
 *     responses:
 *       200:
 *         description: List of videos
 */
router.get('/', videoController.getAllVideos);

/**
 * @swagger
 * /api/videos/upload:
 *   post:
 *     tags:
 *       - Videos
 *     summary: Upload a video file — triggers async HLS transcoding (Admin only)
 *     description: |
 *       Accepts a raw video file (mp4, mov, etc.).
 *       The server immediately returns 202 with status "processing".
 *       FFmpeg transcodes the file to 360p / 720p / 1080p HLS in the
 *       background.  Listen to the socket event `video:<id>:progress`
 *       or poll GET /api/videos/:id for status updates.
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
 *               duration:
 *                 type: number
 *     responses:
 *       202:
 *         description: Upload received — transcoding started in background
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (admin only)
 *       404:
 *         description: Course not found
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
 * /api/videos:
 *   post:
 *     tags:
 *       - Videos
 *     summary: Create a video record from an external URL (Admin only)
 *     description: |
 *       Use this when the video is already hosted externally (CDN / S3 pre-signed URL).
 *       No transcoding is triggered — status is set to "ready" immediately.
 *       For file uploads use POST /api/videos/upload instead.
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
 *               videoUrl:
 *                 type: string
 *                 example: https://cdn.example.com/video.mp4
 *               thumbnailUrl:
 *                 type: string
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
 *       400:
 *         description: Missing title or videoUrl
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (admin only)
 */
router.post('/', auth, isAdmin, videoController.createVideo);

// ─────────────────────────────────────────────────────────────
//  DOWNLOAD
// ─────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/videos/download/{id}:
 *   get:
 *     tags:
 *       - Videos
 *     summary: Download original video file (if permitted)
 *     description: |
 *       Downloads the original .mp4 file stored under uploads/originals/.
 *       - User must be authenticated
 *       - Video must have `allowDownload = true` (set by Admin)
 *       - If the original file was not retained during upload, returns 404
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Video ID
 *     responses:
 *       200:
 *         description: Video file download (video/mp4)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Download not permitted for this video
 *       404:
 *         description: Video not found or original file unavailable
 */
router.get(
  '/download/:id',
  auth,                        // ✅ FIX — download now requires authentication
  videoController.downloadVideo
);

// ─────────────────────────────────────────────────────────────
//  ADMIN TOGGLES  (/:id sub-routes before generic /:id GET)
// ─────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/videos/{id}/download:
 *   patch:
 *     tags:
 *       - Videos
 *     summary: Enable or disable video download (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               allowDownload:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Download permission updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (admin only)
 *       404:
 *         description: Video not found
 */
router.patch(
  '/:id/download',
  auth,
  isAdmin,
  videoController.toggleDownload
);

/**
 * @swagger
 * /api/videos/{id}/watch-restriction:
 *   patch:
 *     tags:
 *       - Videos
 *     summary: Enable or disable minimum watch percentage (Admin only)
 *     description: |
 *       If enabled, the learner must watch at least `minimumWatchPercent`
 *       (default 80%) of the video before they can mark it complete.
 *       Watch progress is validated server-side — the client cannot spoof it.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *             properties:
 *               requireWatchPercentage:
 *                 type: boolean
 *                 example: true
 *               minimumWatchPercent:
 *                 type: number
 *                 example: 80
 *     responses:
 *       200:
 *         description: Watch restriction updated
 *       400:
 *         description: Invalid minimumWatchPercent value
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (admin only)
 *       404:
 *         description: Video not found
 */
router.patch(
  '/:id/watch-restriction',
  auth,
  isAdmin,
  videoController.toggleWatchRestriction
);

/**
 * @swagger
 * /api/videos/{id}/generate-transcript:
 *   post:
 *     tags:
 *       - Videos
 *     summary: Trigger AI transcript generation (Admin only)
 *     description: |
 *       Starts an asynchronous transcript generation job.
 *       Returns immediately with status "processing".
 *       (OpenAI Whisper / NotebookLM integration — placeholder)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transcript generation started
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (admin only)
 *       404:
 *         description: Video not found
 */
router.post(
  '/:id/generate-transcript',
  auth,
  isAdmin,
  videoController.generateTranscript
);

// ─────────────────────────────────────────────────────────────
//  LEARNER — PROGRESS & COMPLETION
// ─────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/videos/{id}/progress:
 *   post:
 *     tags:
 *       - Videos
 *     summary: Save learner watch progress (User)
 *     description: |
 *       Persists the learner's current playback position and the
 *       furthest point they have reached (`maxReached`).
 *       Called automatically by the player every 5 seconds.
 *       `maxReached` is stored server-side and used to validate
 *       force-watch / completion rules — it cannot be spoofed.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               - currentTime
 *             properties:
 *               currentTime:
 *                 type: number
 *                 example: 120.5
 *                 description: Current playback position in seconds
 *               duration:
 *                 type: number
 *                 example: 600
 *                 description: Total video duration in seconds
 *     responses:
 *       200:
 *         description: Progress saved
 *       400:
 *         description: currentTime missing or invalid
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Video not found
 */
router.post(
  '/:id/progress',
  auth,
  videoController.saveProgress
);

/**
 * @swagger
 * /api/videos/{id}/complete:
 *   post:
 *     tags:
 *       - Videos
 *     summary: Mark video as completed (User)
 *     description: |
 *       Marks a video as completed for the authenticated learner.
 *       If `requireWatchPercentage` is enabled on the video, the
 *       server checks the stored `maxReached` value against
 *       `minimumWatchPercent` — the client cannot override this check.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Video ID
 *     responses:
 *       200:
 *         description: Video marked as completed
 *       400:
 *         description: Watch percentage requirement not met
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Video not found
 */
router.post(
  '/:id/complete',
  auth,
  videoController.markVideoComplete
);

// ─────────────────────────────────────────────────────────────
//  CRUD  — /:id  (keep LAST so named sub-routes win above)
// ─────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/videos/{id}:
 *   get:
 *     tags:
 *       - Videos
 *     summary: Get a single video with learner progress
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Video details + learner progress
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Video not found
 */
router.get('/:id', auth, videoController.getVideoById);

/**
 * @swagger
 * /api/videos/{id}:
 *   put:
 *     tags:
 *       - Videos
 *     summary: Update video metadata or replace video file (Admin only)
 *     description: |
 *       If a new video file is included (multipart), the existing HLS
 *       folder is deleted and re-transcoding starts asynchronously.
 *       Text-only updates (title, description, etc.) are applied instantly.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               video:
 *                 type: string
 *                 format: binary
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               moduleTitle:
 *                 type: string
 *               lessonNumber:
 *                 type: number
 *     responses:
 *       200:
 *         description: Video updated (or re-transcoding started)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (admin only)
 *       404:
 *         description: Video not found
 */
router.put(
  '/:id',
  auth,
  isAdmin,
  upload.single('video'),
  videoController.updateVideo
);

/**
 * @swagger
 * /api/videos/{id}:
 *   delete:
 *     tags:
 *       - Videos
 *     summary: Delete video and its HLS files (Admin only)
 *     description: |
 *       Deletes the video record from the database and removes
 *       the entire HLS folder from the filesystem.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Video deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (admin only)
 *       404:
 *         description: Video not found
 */
router.delete('/:id', auth, isAdmin, videoController.deleteVideo);

module.exports = router;