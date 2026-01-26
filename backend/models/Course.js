const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
  uuid: String,
  course_name: String,
  title: String,
  course_type_name: String,
  category_name: String,

  description: String,
  one_line_description: String,
  summary: String,

  seo_title: String,
  seo_description: String,
  seo_url: String,

  banner: String,
  thumbnail_mobile: String,
  thumbnail_web: String,

  duration: String,
  rating: Number,
  rating_count: Number,
  active_learners: Number,

  course_demo: String,
  course_demo_mobile: String,

  prices_inr: Array,
  prices_usd: Array,

  status: Number,
  created_at: Date,
  updated_at: Date
}, { timestamps: true });

module.exports = mongoose.model("Course", CourseSchema);
