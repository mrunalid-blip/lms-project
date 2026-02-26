import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import courseService from "../../services/courseService";

function VideoManagement() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const res = await courseService.getAllCourses();
      setCourses(res.courses || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const deleteCourse = async (uuid) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;

    try {
      await courseService.deleteCourse(uuid);
      loadCourses();
    } catch (err) {
      console.error(err);
      alert("Failed to delete course");
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loading}>
          <div style={styles.loader}></div>
          <p style={styles.loadingText}>Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerIconWrapper}>
            <svg style={styles.headerIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="23 7 16 12 23 17 23 7"/>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
          </div>
          <div>
            <h2 style={styles.title}>Video Management</h2>
            <p style={styles.subtitle}>Manage your course videos and content</p>
          </div>
        </div>

        <button
          style={styles.primaryButton}
          onClick={() => navigate("/admin/course/new")}
          className="primary-button"
        >
          <svg style={styles.buttonIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add New Course
        </button>
      </div>

      {/* Stats Bar */}
      <div style={styles.statsBar}>
        <div style={styles.statItem}>
          <svg style={styles.statIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
          <div>
            <div style={styles.statNumber}>{courses.length}</div>
            <div style={styles.statLabel}>Total Courses</div>
          </div>
        </div>
        <div style={styles.statItem}>
          <svg style={styles.statIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <div>
            <div style={styles.statNumber}>
              {courses.reduce((sum, c) => sum + (c.active_learners || 0), 0)}
            </div>
            <div style={styles.statLabel}>Active Learners</div>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {courses.length === 0 && (
        <div style={styles.empty}>
          <div style={styles.emptyIconWrapper}>
            <svg style={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </div>
          <h3 style={styles.emptyTitle}>No courses found</h3>
          <p style={styles.emptyText}>Click "Add New Course" to begin creating your content</p>
        </div>
      )}

      {/* Course cards */}
      <div style={styles.grid}>
        {courses.map((course) => (
          <div key={course.uuid} style={styles.card} className="course-card">
            <div style={styles.cardHeader}>
              <div style={styles.cardIconWrapper}>
                <svg style={styles.cardIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
              </div>
              <div style={styles.cardBadge}>Course</div>
            </div>

            <div style={styles.cardBody}>
              <h3 style={styles.courseTitle}>
                {course.course_name}
              </h3>

              {/* Course Meta */}
              <div style={styles.courseMeta}>
                {course.active_learners !== undefined && course.active_learners > 0 && (
                  <div style={styles.metaItem}>
                    <svg style={styles.metaIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                    </svg>
                    <span>{course.active_learners} learners</span>
                  </div>
                )}
                {course.duration_years !== undefined && course.duration_years > 0 && (
                  <div style={styles.metaItem}>
                    <svg style={styles.metaIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <span>{course.duration_years} year(s)</span>
                  </div>
                )}
              </div>
            </div>

            <div style={styles.actions}>
              <button
                style={styles.manageBtn}
                onClick={() =>
                  navigate(`/admin/course/${course.uuid}/videos`)
                }
                className="manage-button"
              >
                <svg style={styles.actionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="23 7 16 12 23 17 23 7"/>
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                </svg>
                Videos
              </button>

              <button
                style={styles.editBtn}
                onClick={() =>
                  navigate(`/admin/course/${course.uuid}/edit`)
                }
                title="Edit course"
                className="icon-button"
              >
                <svg style={styles.actionIconSmall} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>

              <button
                style={styles.deleteBtn}
                onClick={() => deleteCourse(course.uuid)}
                title="Delete course"
                className="icon-button delete-button"
              >
                <svg style={styles.actionIconSmall} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  <line x1="10" y1="11" x2="10" y2="17"/>
                  <line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===================== STYLES ===================== */

const styles = {
  page: {
    padding: "32px",
    background: "linear-gradient(to bottom, #f8fafc 0%, #e2e8f0 100%)",
    minHeight: "100vh",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
    padding: "32px",
    background: "white",
    borderRadius: "20px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    border: "1px solid rgba(0,0,0,0.04)",
  },

  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },

  headerIconWrapper: {
    width: "56px",
    height: "56px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 16px rgba(102, 126, 234, 0.3)",
  },

  headerIcon: {
    width: "28px",
    height: "28px",
    color: "white",
  },

  title: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#1e293b",
    margin: "0 0 4px 0",
  },

  subtitle: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0,
    fontWeight: "500",
  },

  primaryButton: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    border: "none",
    padding: "14px 24px",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
    transition: "all 0.3s ease",
  },

  buttonIcon: {
    width: "18px",
    height: "18px",
  },

  statsBar: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginBottom: "32px",
  },

  statItem: {
    background: "white",
    padding: "24px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
    border: "1px solid rgba(0,0,0,0.04)",
    transition: "all 0.3s ease",
  },

  statIcon: {
    width: "40px",
    height: "40px",
    padding: "10px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "12px",
    color: "white",
    flexShrink: 0,
  },

  statNumber: {
    fontSize: "28px",
    fontWeight: "800",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    lineHeight: "1",
    marginBottom: "4px",
  },

  statLabel: {
    fontSize: "13px",
    color: "#64748b",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  loading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
    gap: "24px",
  },

  loader: {
    width: "60px",
    height: "60px",
    border: "4px solid #e2e8f0",
    borderTop: "4px solid #667eea",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  loadingText: {
    fontSize: "18px",
    color: "#64748b",
    fontWeight: "600",
  },

  empty: {
    background: "white",
    padding: "80px 40px",
    borderRadius: "20px",
    textAlign: "center",
    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
    border: "1px solid rgba(0,0,0,0.04)",
  },

  emptyIconWrapper: {
    width: "100px",
    height: "100px",
    margin: "0 auto 24px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 24px rgba(102, 126, 234, 0.3)",
  },

  emptyIcon: {
    width: "50px",
    height: "50px",
    color: "white",
  },

  emptyTitle: {
    fontSize: "24px",
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: "8px",
  },

  emptyText: {
    fontSize: "16px",
    color: "#64748b",
    margin: 0,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: "24px",
  },

  card: {
    background: "white",
    borderRadius: "20px",
    padding: "28px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    border: "1px solid rgba(0,0,0,0.04)",
    transition: "all 0.4s ease",
    position: "relative",
    overflow: "hidden",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  cardIconWrapper: {
    width: "48px",
    height: "48px",
    background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid #e2e8f0",
  },

  cardIcon: {
    width: "24px",
    height: "24px",
    color: "#667eea",
  },

  cardBadge: {
    padding: "6px 14px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    borderRadius: "50px",
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  cardBody: {
    flex: 1,
    marginBottom: "20px",
  },

  courseTitle: {
    fontSize: "20px",
    fontWeight: "700",
    marginBottom: "16px",
    color: "#1e293b",
    lineHeight: "1.3",
  },

  courseMeta: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
  },

  metaItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    color: "#64748b",
    fontWeight: "500",
  },

  metaIcon: {
    width: "16px",
    height: "16px",
    color: "#667eea",
  },

  actions: {
    display: "flex",
    gap: "10px",
    paddingTop: "20px",
    borderTop: "2px solid #f1f5f9",
  },

  manageBtn: {
    flex: 1,
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "12px 16px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 8px rgba(102, 126, 234, 0.3)",
  },

  actionIcon: {
    width: "16px",
    height: "16px",
  },

  editBtn: {
    background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    border: "2px solid #e2e8f0",
    borderRadius: "12px",
    padding: "12px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  deleteBtn: {
    background: "linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%)",
    color: "#ef4444",
    border: "2px solid #fecaca",
    borderRadius: "12px",
    padding: "12px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  actionIconSmall: {
    width: "18px",
    height: "18px",
  },
};

// Add keyframe animations and hover effects via a style tag
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
    
    .primary-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4) !important;
    }
    
    .stat-item:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 30px rgba(0,0,0,0.12) !important;
    }
    
    .course-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 40px rgba(0,0,0,0.15) !important;
    }
    
    .manage-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4) !important;
    }
    
    .icon-button:hover {
      transform: scale(1.1);
      border-color: #cbd5e0 !important;
    }
    
    .delete-button:hover {
      background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%) !important;
      border-color: #f87171 !important;
      transform: scale(1.1);
    }
  `;
  document.head.appendChild(styleSheet);
}

export default VideoManagement;