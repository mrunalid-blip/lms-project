const mongoose = require("mongoose");
const fs = require("fs");
require("dotenv").config();

const Course = require("../models/Course");

// connect db
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(console.error);

// load JSON (ARRAY)
const courses = JSON.parse(
  fs.readFileSync("./scripts/ahbf-courses.json", "utf8")
);

async function importCourses() {
  try {
    console.log(`📦 Found ${courses.length} courses`);

    for (const course of courses) {
      await Course.updateOne(
        { uuid: course.uuid },        // prevents duplicates
        { $set: course },
        { upsert: true }
      );

      console.log(`✅ Imported: ${course.course_name}`);
    }

    console.log("🎉 Course import completed");
    process.exit(0);
  } catch (err) {
    console.error("❌ Import failed", err);
    process.exit(1);
  }
}

importCourses();
