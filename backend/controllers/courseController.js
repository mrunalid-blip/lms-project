const Course = require("../models/Course");
const { v4: uuidv4 } = require("uuid");

/**
 * Admin: Create Course
 */
exports.createCourse = async (req, res) => {
  try {
    const { course_name, description } = req.body;

    if (!course_name) {
      return res.status(400).json({ error: "course_name is required" });
    }

    const course = new Course({
      uuid: uuidv4(),
      course_name,
      description,
      status: 1,
      created_at: new Date(),
      updated_at: new Date(),
    });

    await course.save();

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      course,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Admin: Update Course
 */
exports.updateCourse = async (req, res) => {
  try {
    const { uuid } = req.params;

    const course = await Course.findOneAndUpdate(
      { uuid },
      { ...req.body, updated_at: new Date() },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.json({
      success: true,
      message: "Course updated successfully",
      course,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Admin: Delete Course
 */
exports.deleteCourse = async (req, res) => {
  try {
    const { uuid } = req.params;

    const course = await Course.findOneAndDelete({ uuid });
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
