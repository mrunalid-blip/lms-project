import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import videoService from "../../services/videoService";

function EditVideo() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [moduleTitle, setModuleTitle] = useState("");
  const [lessonNumber, setLessonNumber] = useState("");
  const [videoFile, setVideoFile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadVideo();
    // eslint-disable-next-line
  }, [id]);

  const loadVideo = async () => {
    try {
      const res = await videoService.getVideoById(id);
      const video = res.video;

      setTitle(video?.title || "");
      setDescription(video?.description || "");
      setModuleTitle(video?.moduleTitle || "");
      setLessonNumber(video?.lessonNumber || "");
    } catch (err) {
      console.error(err);
      alert("Failed to load video ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const fd = new FormData();
      fd.append("title", title);
      fd.append("description", description);
      fd.append("moduleTitle", moduleTitle);
      fd.append("lessonNumber", lessonNumber);

      // 👉 Only attach video if user selected a new one
      if (videoFile) {
        fd.append("video", videoFile);
      }

      await videoService.updateVideo(id, fd);

      alert("Video updated successfully ✅");
      navigate(-1);
    } catch (err) {
      console.error(err);
      alert("Update failed ❌");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loading}>
          <div style={styles.loader}></div>
          <p style={styles.loadingText}>Loading video…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.pageHeader}>
        <div style={styles.headerLeft}>
          <div style={styles.headerIconWrapper}>
            <svg style={styles.headerIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </div>
          <div>
            <h1 style={styles.pageTitle}>Edit Video</h1>
            <p style={styles.pageSubtitle}>
              Update lesson details or replace the video file
            </p>
          </div>
        </div>

        <button
          style={styles.backBtn}
          onClick={() => navigate(-1)}
          className="back-button"
        >
          <svg style={styles.backIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          Back
        </button>
      </div>

      {/* Card */}
      <div style={styles.card}>
        <form onSubmit={handleUpdate} style={styles.form}>
          {/* Title */}
          <div style={styles.field}>
            <label style={styles.label}>
              <svg style={styles.labelIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="23 7 16 12 23 17 23 7"/>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
              </svg>
              Video Title
              <span style={styles.required}>*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={styles.input}
              placeholder="Enter video title"
              required
              className="form-input"
            />
          </div>

          {/* Module & Lesson */}
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>
                <svg style={styles.labelIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                </svg>
                Module
              </label>
              <input
                value={moduleTitle}
                onChange={(e) =>
                  setModuleTitle(e.target.value)
                }
                style={styles.input}
                placeholder="e.g., Introduction to Surgery"
                className="form-input"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                <svg style={styles.labelIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                Lesson Number
              </label>
              <input
                type="number"
                min="1"
                value={lessonNumber}
                onChange={(e) =>
                  setLessonNumber(e.target.value)
                }
                style={styles.input}
                placeholder="1"
                className="form-input"
              />
            </div>
          </div>

          {/* Description */}
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
            </label>
            <textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              style={styles.textarea}
              placeholder="Short description about this lesson"
              className="form-input"
            />
          </div>

          {/* Video Replace */}
          <div style={styles.field}>
            <label style={styles.label}>
              <svg style={styles.labelIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Replace Video
              <span style={styles.optional}>(optional)</span>
            </label>

            <label style={styles.uploadBox} className="upload-box">
              <input
                type="file"
                accept="video/mp4"
                hidden
                onChange={(e) =>
                  setVideoFile(e.target.files[0])
                }
              />

              <div style={styles.uploadContent}>
                <div style={styles.uploadIconWrapper}>
                  <svg style={styles.uploadIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {videoFile ? (
                      <>
                        <polyline points="20 6 9 17 4 12"/>
                      </>
                    ) : (
                      <>
                        <polygon points="23 7 16 12 23 17 23 7"/>
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                      </>
                    )}
                  </svg>
                </div>
                <p style={styles.uploadText}>
                  {videoFile
                    ? videoFile.name
                    : "Click to select new video (MP4)"}
                </p>
                <small style={styles.uploadHint}>
                  {videoFile 
                    ? `Size: ${(videoFile.size / 1024 / 1024).toFixed(2)} MB`
                    : "Leave empty to keep existing video"}
                </small>
              </div>
            </label>
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
                <strong>Note:</strong> If you don't upload a new video file, the existing video will remain unchanged.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div style={styles.actions}>
            <button
              type="button"
              style={styles.cancelBtn}
              onClick={() => navigate(-1)}
              disabled={saving}
              className="cancel-button"
            >
              <svg style={styles.actionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Cancel
            </button>

            <button
              type="submit"
              style={styles.submitBtn}
              disabled={saving}
              className="submit-button"
            >
              {saving ? (
                <>
                  <div style={styles.spinner}></div>
                  Updating…
                </>
              ) : (
                <>
                  <svg style={styles.actionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/>
                    <polyline points="7 3 7 8 15 8"/>
                  </svg>
                  Update Video
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditVideo;

/* ===================== STYLES ===================== */

const styles = {
  page: {
    padding: "32px",
    background: "linear-gradient(to bottom, #f8fafc 0%, #e2e8f0 100%)",
    minHeight: "100vh",
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
    color: "#64748b",
    fontSize: "18px",
    fontWeight: "600",
  },

  pageHeader: {
    maxWidth: "900px",
    margin: "0 auto 32px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
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

  pageTitle: {
    margin: "0 0 6px 0",
    fontSize: "28px",
    fontWeight: "800",
    color: "#1e293b",
  },

  pageSubtitle: {
    marginTop: "6px",
    fontSize: "14px",
    color: "#64748b",
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
    maxWidth: "900px",
    margin: "0 auto",
    background: "#fff",
    padding: "40px",
    borderRadius: "20px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    border: "1px solid rgba(0,0,0,0.04)",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "28px",
  },

  row: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minWidth: "220px",
  },

  label: {
    fontSize: "14px",
    fontWeight: "700",
    marginBottom: "10px",
    color: "#1e293b",
    display: "flex",
    alignItems: "center",
    gap: "8px",
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
    padding: "14px 16px",
    borderRadius: "12px",
    border: "2px solid #e2e8f0",
    fontSize: "15px",
    transition: "all 0.3s ease",
    outline: "none",
    backgroundColor: "#f8fafc",
  },

  textarea: {
    padding: "14px 16px",
    borderRadius: "12px",
    border: "2px solid #e2e8f0",
    minHeight: "120px",
    resize: "vertical",
    fontSize: "15px",
    transition: "all 0.3s ease",
    outline: "none",
    fontFamily: "inherit",
    backgroundColor: "#f8fafc",
  },

  uploadBox: {
    border: "3px dashed #cbd5e0",
    borderRadius: "16px",
    padding: "32px",
    background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "block",
  },

  uploadContent: {
    textAlign: "center",
  },

  uploadIconWrapper: {
    width: "64px",
    height: "64px",
    margin: "0 auto 16px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
  },

  uploadIcon: {
    width: "32px",
    height: "32px",
    color: "white",
  },

  uploadText: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1e293b",
    margin: "0 0 8px 0",
  },

  uploadHint: {
    fontSize: "13px",
    color: "#64748b",
    display: "block",
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
    marginTop: "12px",
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
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

  submitBtn: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    border: "none",
    padding: "14px 28px",
    borderRadius: "12px",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "15px",
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
    
    .upload-box:hover {
      border-color: #667eea !important;
      background: white !important;
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15) !important;
    }
    
    .cancel-button:hover {
      background: white !important;
      border-color: #cbd5e0 !important;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
    }
    
    .submit-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4) !important;
    }
    
    .submit-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `;
  document.head.appendChild(styleSheet);
}
