const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

const connectDB = require("./config/database");

const authRoutes = require("./routes/auth");
const videoRoutes = require("./routes/videos");
const progressRoutes = require("./routes/progress");
const noteRoutes = require("./routes/notes");
const bookmarkRoutes = require("./routes/bookmarks");
const courseRoutes = require("./routes/courses");
const enrollmentRoutes = require("./routes/enrollments");
const adminCourseRoutes = require("./routes/adminCourses");
const adminUserRoutes = require("./routes/adminUsers");
const commentRoutes = require("./routes/comments");
const reactionRoutes = require("./routes/videoReaction.routes");
const { auth } = require("./middleware/auth");


const app = express();

connectDB();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json());

// ✅ Serve UI
app.use(express.static(path.join(__dirname, "public")));

// ✅ Serve uploaded videos
// 🔒 Secure HLS Streaming Folder

// ✅ Swagger Docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ✅ Health
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/admin", adminCourseRoutes);
app.use("/api/admin", adminUserRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api", reactionRoutes);


app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
