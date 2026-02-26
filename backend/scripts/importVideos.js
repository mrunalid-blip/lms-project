const mongoose = require("mongoose");
const fs = require("fs");
require("dotenv").config();

const Video = require("../models/Video");
const Course = require("../models/Course");

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(console.error);

const videos = JSON.parse(
  fs.readFileSync("./scripts/course-videos.json", "utf8")
);

async function importVideos() {
  try {
    console.log(`🎬 Found ${videos.length} videos`);

    for (const v of videos) {

      const course = await Course.findOne({ uuid: v.courseUuid });
      if (!course) {
        console.log(`❌ Course not found: ${v.courseUuid}`);
        continue;
      }

      // ✅ Folder name derived from filename
      const folderName = v.videoFile.split(".")[0];

      await Video.updateOne(
        {
          courseUuid: v.courseUuid,
          lessonNumber: v.lessonNumber
        },
        {
          $set: {
            title: v.title,
            description: v.description,
            videoUrl: `/uploads/hls/${folderName}/index.m3u8`,
            duration: v.duration,
            moduleTitle: v.moduleTitle,
            courseUuid: course.uuid,
            courseName: course.course_name,
            status: "ready"
          }
        },
        { upsert: true }
      );

      console.log(`✅ Stored video: ${v.title}`);
    }

    console.log("🎉 Video import completed");
    process.exit(0);

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

importVideos();