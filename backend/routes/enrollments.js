const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const { auth } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   - name: Enrollments
 *     description: Course enrollment APIs
 */

/**
 * @swagger
 * /api/enrollments:
 *   post:
 *     tags:
 *       - Enrollments
 *     summary: Enroll user in a course
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *             properties:
 *               courseId:
 *                 type: string
 *                 example: 65fb9b6f1c9e8c0012abcd34
 *     responses:
 *       201:
 *         description: Course enrolled successfully
 */
router.post('/', auth, enrollmentController.enrollCourse);

/**
 * @swagger
 * /api/enrollments/my:
 *   get:
 *     tags:
 *       - Enrollments
 *     summary: Get my enrolled courses
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of enrolled courses
 */
router.get('/my', auth, enrollmentController.getMyEnrollments);

module.exports = router;
