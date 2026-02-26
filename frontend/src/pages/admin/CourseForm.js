import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import courseService from "../../services/courseService";

export default function CourseForm() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(courseId);

  const [form, setForm] = useState({
    course_name: "",
    description: "",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      loadCourse();
    }
  }, [courseId]);

  const loadCourse = async () => {
    const res = await courseService.getCourseById(courseId);
    setForm({
      course_name: res.course.course_name,
      description: res.course.description || "",
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async () => {
    try {
      setSaving(true);

      if (isEdit) {
        await courseService.updateCourse(courseId, form);
      } else {
        await courseService.createCourse(form);
      }

      navigate("/admin/videos");
    } catch (err) {
      console.error(err);
      alert("Failed to save course");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.headerCard}>
        <div style={styles.headerContent}>
          <div style={styles.headerIconWrapper}>
            <svg style={styles.headerIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {isEdit ? (
                <>
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </>
              ) : (
                <>
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </>
              )}
            </svg>
          </div>
          <div>
            <h2 style={styles.pageTitle}>
              {isEdit ? "Edit Course" : "Add New Course"}
            </h2>
            <p style={styles.pageSubtitle}>
              {isEdit ? "Update course information" : "Create a new course for your platform"}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate("/admin/videos")}
          style={styles.backBtn}
          className="back-button"
        >
          <svg style={styles.backIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          Back
        </button>
      </div>

      <div style={styles.card}>
        <div style={styles.formHeader}>
          <svg style={styles.formHeaderIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
          <h3 style={styles.formTitle}>Course Details</h3>
        </div>

        <div style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>
              <svg style={styles.labelIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
              Course Name
              <span style={styles.required}>*</span>
            </label>
            <input
              name="course_name"
              value={form.course_name}
              onChange={handleChange}
              placeholder="Enter course name"
              style={styles.input}
              className="form-input"
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>
              <svg style={styles.labelIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              Description
              <span style={styles.optional}>(optional)</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe what this course is about"
              style={styles.textarea}
              className="form-input"
            />
            <div style={styles.charCount}>
              {form.description.length} characters
            </div>
          </div>

          {/* Info Box */}
          <div style={styles.infoBox}>
            <svg style={styles.infoIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <div>
              <p style={styles.infoText}>
                <strong>Tip:</strong> A clear course name and description help students understand what they'll learn.
              </p>
            </div>
          </div>

          <div style={styles.actions}>
            <button
              onClick={() => navigate("/admin/videos")}
              style={styles.cancelBtn}
              className="cancel-button"
            >
              <svg style={styles.actionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Cancel
            </button>

            <button
              onClick={submit}
              disabled={saving}
              style={{
                ...styles.saveBtn,
                opacity: saving ? 0.6 : 1,
              }}
              className="save-button"
            >
              {saving ? (
                <>
                  <div style={styles.spinner}></div>
                  Saving...
                </>
              ) : (
                <>
                  <svg style={styles.actionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {isEdit ? (
                      <>
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                        <polyline points="17 21 17 13 7 13 7 21"/>
                        <polyline points="7 3 7 8 15 8"/>
                      </>
                    ) : (
                      <>
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                      </>
                    )}
                  </svg>
                  {isEdit ? "Update Course" : "Create Course"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================== STYLES ===================== */

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(to bottom, #f8fafc 0%, #e2e8f0 100%)",
    padding: "32px",
  },

  headerCard: {
    maxWidth: "700px",
    margin: "0 auto 32px",
    background: "white",
    padding: "32px",
    borderRadius: "20px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    border: "1px solid rgba(0,0,0,0.04)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerContent: {
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

  pageTitle: {
    margin: "0 0 6px 0",
    fontSize: "28px",
    fontWeight: "800",
    color: "#1e293b",
  },

  pageSubtitle: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0,
    fontWeight: "500",
  },

  backBtn: {
    background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    border: "2px solid #e2e8f0",
    padding: "12px 20px",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
    color: "#475569",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.3s ease",
  },

  backIcon: {
    width: "18px",
    height: "18px",
  },

  card: {
    width: "100%",
    maxWidth: "700px",
    background: "#fff",
    borderRadius: "20px",
    padding: "40px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    border: "1px solid rgba(0,0,0,0.04)",
    margin: "0 auto",
  },

  formHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "32px",
    paddingBottom: "24px",
    borderBottom: "2px solid #f1f5f9",
  },

  formHeaderIcon: {
    width: "24px",
    height: "24px",
    color: "#667eea",
  },

  formTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "800",
    color: "#1e293b",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "28px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
  },

  label: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "10px",
    fontSize: "14px",
    fontWeight: "700",
    color: "#1e293b",
  },

  labelIcon: {
    width: "18px",
    height: "18px",
    color: "#667eea",
  },

  required: {
    color: "#ef4444",
    marginLeft: "4px",
  },

  optional: {
    fontSize: "12px",
    fontWeight: "500",
    color: "#94a3b8",
    marginLeft: "4px",
  },

  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "12px",
    border: "2px solid #e2e8f0",
    fontSize: "15px",
    transition: "all 0.3s ease",
    outline: "none",
    backgroundColor: "#f8fafc",
    boxSizing: "border-box",
  },

  textarea: {
    width: "100%",
    minHeight: "140px",
    padding: "14px 16px",
    borderRadius: "12px",
    border: "2px solid #e2e8f0",
    fontSize: "15px",
    resize: "vertical",
    transition: "all 0.3s ease",
    outline: "none",
    backgroundColor: "#f8fafc",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },

  charCount: {
    fontSize: "12px",
    color: "#94a3b8",
    marginTop: "6px",
    textAlign: "right",
  },

  infoBox: {
    display: "flex",
    gap: "12px",
    padding: "16px 20px",
    background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
    borderRadius: "12px",
    border: "1px solid #93c5fd",
  },

  infoIcon: {
    width: "20px",
    height: "20px",
    color: "#2563eb",
    flexShrink: 0,
    marginTop: "2px",
  },

  infoText: {
    fontSize: "14px",
    color: "#1e40af",
    margin: 0,
    lineHeight: "1.6",
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "12px",
    paddingTop: "28px",
    borderTop: "2px solid #f1f5f9",
  },

  cancelBtn: {
    background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    border: "2px solid #e2e8f0",
    padding: "14px 24px",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
    color: "#475569",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.3s ease",
  },

  saveBtn: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    border: "none",
    padding: "14px 28px",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
  },

  actionIcon: {
    width: "18px",
    height: "18px",
  },

  spinner: {
    width: "18px",
    height: "18px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "white",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
};

// Add keyframe animations and hover effects via a style tag
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .back-button:hover {
      background: white !important;
      border-color: #cbd5e0 !important;
      transform: translateX(-4px);
    }
    
    .form-input:focus {
      border-color: #667eea !important;
      background: white !important;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
    }
    
    .cancel-button:hover {
      background: white !important;
      border-color: #cbd5e0 !important;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
    }
    
    .save-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4) !important;
    }
    
    .save-button:disabled {
      cursor: not-allowed;
    }
  `;
  document.head.appendChild(styleSheet);
}

