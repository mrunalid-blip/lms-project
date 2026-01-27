const express = require("express");
const router = express.Router();
const adminUserController = require("../controllers/adminUserController");
const { auth, isAdmin } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Admin Users
 *   description: Admin user and enrollment management
 */

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     tags: [Admin Users]
 *     summary: Get all users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
router.get("/users", auth, isAdmin, adminUserController.getAllUsers);

/**
 * @swagger
 * /api/admin/users/{userId}/courses:
 *   get:
 *     tags: [Admin Users]
 *     summary: Get courses assigned to a user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           example: 65fb9b6f1c9e8c0012abcd34
 *     responses:
 *       200:
 *         description: User enrolled courses
 */
router.get(
  "/users/:userId/courses",
  auth,
  isAdmin,
  adminUserController.getUserCourses
);

/**
 * @swagger
 * /api/admin/users/{userId}/enroll:
 *   post:
 *     tags: [Admin Users]
 *     summary: Assign a course to a user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
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
 *               - courseId
 *             properties:
 *               courseId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Course assigned successfully
 */
router.post(
  "/users/:userId/enroll",
  auth,
  isAdmin,
  adminUserController.assignCourse
);

/**
 * @swagger
 * /api/admin/users/{userId}/role:
 *   patch:
 *     tags: [Admin Users]
 *     summary: Change user role (admin / learner)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
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
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 example: admin
 *     responses:
 *       200:
 *         description: Role updated
 */
router.patch(
  "/users/:userId/role",
  auth,
  isAdmin,
  adminUserController.updateUserRole
);


/**
 * @swagger
 * /api/admin/users/{userId}/courses/{courseId}:
 *   delete:
 *     tags: [Admin Users]
 *     summary: Remove course from a user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *       - in: path
 *         name: courseId
 *         required: true
 *     responses:
 *       200:
 *         description: Course removed successfully
 */
router.delete(
  "/users/:userId/courses/:courseId",
  auth,
  isAdmin,
  adminUserController.removeCourse
);

/**
 * @swagger
 * /api/admin/users/{userId}/status:
 *   patch:
 *     tags: [Admin Users]
 *     summary: Enable or disable a user account
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *     responses:
 *       200:
 *         description: User status updated
 */
router.patch(
  "/users/:userId/status",
  auth,
  isAdmin,
  adminUserController.toggleUserStatus
);

module.exports = router;


