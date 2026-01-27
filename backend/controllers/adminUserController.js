const User = require("../models/User");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");

// 1️⃣ Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2️⃣ Get user's courses (FIXED ✅)
exports.getUserCourses = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({
      userId: req.params.userId,
    }).populate("courseId");

    const courses = enrollments.map(e => ({
      courseId: e.courseId._id,
      courseUuid: e.courseId.uuid,
      courseName: e.courseId.course_name,
    }));

    res.json({ success: true, courses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3️⃣ Assign course to user (FIXED ✅)
exports.assignCourse = async (req, res) => {
  try {
    const { courseUuid } = req.body;

    const course = await Course.findOne({ uuid: courseUuid });
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const exists = await Enrollment.findOne({
      userId: req.params.userId,
      courseId: course._id,
    });

    if (exists) {
      return res.status(400).json({ error: "User already enrolled" });
    }

    await Enrollment.create({
      userId: req.params.userId,
      courseId: course._id,
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4️⃣ Remove course (FIXED ✅)
exports.removeCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const deleted = await Enrollment.deleteOne({
      userId: req.params.userId,
      courseId,
    });

    if (deleted.deletedCount === 0) {
      return res.status(404).json({ error: "Enrollment not found" });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 5️⃣ Enable / Disable user (ADMIN CAN DO THIS)
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ success: true, isActive: user.isActive });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 6️⃣ Change user role (admin <-> learner)
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!["admin", "learner"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 🔒 Prevent admin removing own admin access
    if (req.user.id === user._id.toString() && role !== "admin") {
      return res.status(403).json({
        error: "You cannot remove your own admin access",
      });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: `User role updated to ${role}`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
