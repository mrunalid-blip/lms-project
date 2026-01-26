const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");
const { auth, isAdmin } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Admin Courses
 *   description: Admin course management
 */

/**
 * @swagger
 * /api/admin/courses:
 *   post:
 *     tags: [Admin Courses]
 *     summary: Create a new course
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - course_name
 *             properties:
 *               course_name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Course created successfully
 */
router.post("/courses", auth, isAdmin, courseController.createCourse);

/**
 * @swagger
 * /api/admin/courses/{uuid}:
 *   put:
 *     tags: [Admin Courses]
 *     summary: Update a course
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *     responses:
 *       200:
 *         description: Course updated
 */
router.put("/courses/:uuid", auth, isAdmin, courseController.updateCourse);

/**
 * @swagger
 * /api/admin/courses/{uuid}:
 *   delete:
 *     tags: [Admin Courses]
 *     summary: Delete a course
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course deleted
 */
router.delete("/courses/:uuid", auth, isAdmin, courseController.deleteCourse);

module.exports = router;
