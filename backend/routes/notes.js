const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const { auth } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   - name: Notes
 *     description: Video notes APIs
 */

/**
 * @swagger
 * /api/notes/{videoId}:
 *   post:
 *     tags:
 *       - Notes
 *     summary: Create a note for a video
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
 *               - noteText
 *             properties:
 *               timestampSeconds:
 *                 type: number
 *                 example: 120
 *               noteText:
 *                 type: string
 *                 example: Important explanation of this topic
 *     responses:
 *       201:
 *         description: Note created successfully
 */
router.post('/:videoId', auth, noteController.createNote);


/**
 * @swagger
 * /api/notes/{videoId}:
 *   get:
 *     tags:
 *       - Notes
 *     summary: Get notes for a video
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *     responses:
 *       200:
 *         description: List of notes
 */
router.get('/:videoId', auth, noteController.getNotes);

/**
 * @swagger
 * /api/notes/{noteId}:
 *   put:
 *     tags:
 *       - Notes
 *     summary: Update an existing note
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: noteId
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
 *               - noteText
 *             properties:
 *               noteText:
 *                 type: string
 *                 example: Updated note text
 *     responses:
 *       200:
 *         description: Note updated successfully
 */
router.put('/:noteId', auth, noteController.updateNote);


/**
 * @swagger
 * /api/notes/{noteId}:
 *   delete:
 *     tags:
 *       - Notes
 *     summary: Delete a note
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: noteId
 *         required: true
 *     responses:
 *       200:
 *         description: Note deleted
 */
router.delete('/:noteId', auth, noteController.deleteNote);

module.exports = router;
