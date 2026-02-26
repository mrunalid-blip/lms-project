import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import courseService from "../services/courseService";
import videoService from "../services/videoService";

function VideoList() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [courseProgressMap, setCourseProgressMap] = useState({});
const loadCourses = useCallback(async () => {
  try {
    const enrollments = await courseService.getMyEnrollments();

    // ✅ FETCH FULL COURSES
    const fullCourses = await Promise.all(
      enrollments.map(async (e) => {
        const res = await courseService.getCourseById(e.courseId.uuid);
        return res.course;
      })
    );

    setCourses(fullCourses);

    // 🔥 progress logic stays SAME
    const progressRes = await videoService.getAllProgress();
    const progressList = progressRes.progressList || [];

    const totalVideosMap = {};
    for (const course of fullCourses) {
      const res = await videoService.getVideosByCourse(course.uuid);
      totalVideosMap[course.uuid] = res.videos?.length || 0;
    }

    const progressMap = {};
    fullCourses.forEach((course) => {
     const courseProgress = progressList.filter((p) => {
  if (!p.videoId) return false;

  return (
    typeof p.videoId === "object" &&
    p.videoId.courseUuid === course.uuid &&
    p.completed
  );
});

      progressMap[course.uuid] = totalVideosMap[course.uuid]
        ? Math.round(
            (courseProgress.length / totalVideosMap[course.uuid]) * 100
          )
        : 0;
    });

    setCourseProgressMap(progressMap);

  } catch (err) {
    console.error(err);
    setError("Failed to load your enrolled courses");
  } finally {
    setLoading(false);
  }
}, []);


  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p>Loading your courses...</p>
        </div>
      </>
    );
  }

  return (
    <div style={styles.page}>
      <Navbar />

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>My Learning Dashboard</h1>
          <p style={styles.subtitle}>
            Continue where you left off in your medical education
          </p>
        </div>

        {/* Error */}
        {error && <div style={styles.error}>{error}</div>}

        {/* Empty State */}
        {courses.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>📚</div>
            <h3>No enrolled courses yet</h3>
            <p>Browse courses and start learning today</p>
            <button onClick={() => navigate("/")} style={styles.primaryBtn}>
              Browse Courses
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {courses.map((course) => (
              <Link
                key={course.uuid}
                to={`/course/${course.uuid}/learn`}
                style={styles.card}
              >
                {/* Thumbnail */}
                <div style={styles.thumbnail}>
                  {course.banner ? (
                    <img
                      src={
                        course.banner?.startsWith("http")
                          ? course.banner
                          : `${process.env.REACT_APP_API_BASE_URL}${course.banner}`
                      }
                      alt={course.course_name}
                      style={styles.thumbImg}
                    />
                  ) : (
                    <div style={styles.placeholder}>▶</div>
                  )}

                  <span style={styles.badge}>
                    {course.course_type_name || "Course"}
                  </span>
                </div>

                {/* Content */}
                <div style={styles.body}>
                  <h3 style={styles.courseTitle}>{course.course_name}</h3>

                  <p style={styles.desc}>
                    {course.one_line_description
                      ?.replace(/<[^>]*>/g, "")
                      .slice(0, 120)}
                    ...
                  </p>

                  {/* Meta */}
                  <div style={styles.meta}>
                    <span>⏱ {course.duration || "—"}</span>
                    <span>👥 {course.active_learners || 0}</span>
                  </div>

                  {/* Progress (static for now) */}
                  <div style={styles.progressWrap}>
                    <div style={styles.progressBar}>
                      <div
                        style={{
                          ...styles.progressFill,
                          width: `${courseProgressMap[course.uuid] || 0}%`,
                        }}
                      />
                    </div>
                    <small>
                      {courseProgressMap[course.uuid] || 0}% completed
                    </small>
                  </div>

                  {/* Footer */}
                  <div style={styles.footer}>
                    <span>⭐ {course.rating || 4.0}</span>
                    <span style={styles.cta}>Continue →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoList;

/* ===================== STYLES ===================== */

const styles = {
  page: {
    background: "#f6f7fb",
    minHeight: "100vh",
  },
  container: {
    maxWidth: 1300,
    margin: "0 auto",
    padding: 30,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 34,
    fontWeight: 700,
    color: "#111",
  },
  subtitle: {
    color: "#666",
    marginTop: 8,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: 24,
  },
  card: {
    background: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    boxShadow: "0 6px 16px rgba(0,0,0,.08)",
    textDecoration: "none",
    color: "inherit",
    transition: "transform .2s",
  },
  thumbnail: {
    position: "relative",
    paddingTop: "56.25%",
    background: "#000",
  },
  thumbImg: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  placeholder: {
    position: "absolute",
    inset: 0,
    background: "#4a5670ff",
    color: "#fff",
    fontSize: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 12,
    left: 12,
    background: "#16a34a",
    color: "#fff",
    fontSize: 12,
    padding: "4px 10px",
    borderRadius: 20,
  },
  body: {
    padding: 18,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 8,
  },
  desc: {
    fontSize: 14,
    color: "#666",
    lineHeight: 1.5,
    marginBottom: 12,
  },
  meta: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 13,
    color: "#555",
  },
  progressWrap: {
    marginTop: 14,
  },
  progressBar: {
    height: 6,
    background: "#e5e7eb",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressFill: {
    height: "100%",
    background: "#788dbbff",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 14,
    fontSize: 13,
    fontWeight: 600,
  },
  cta: {
    color: "#2563eb",
  },
  loading: {
    textAlign: "center",
    padding: 80,
  },
  spinner: {
    width: 40,
    height: 40,
    border: "4px solid #ddd",
    borderTop: "4px solid #5e6f93ff",
    borderRadius: "50%",
    margin: "0 auto 20px",
    animation: "spin 1s linear infinite",
  },
  empty: {
    background: "#fff",
    padding: 80,
    borderRadius: 16,
    textAlign: "center",
  },
  emptyIcon: {
    fontSize: 60,
  },
  primaryBtn: {
    marginTop: 20,
    background: "#7488b2ff",
    color: "#fff",
    border: "none",
    padding: "12px 24px",
    borderRadius: 8,
    cursor: "pointer",
  },
  error: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
  },
};
