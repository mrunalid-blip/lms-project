import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import videoService from "../../services/videoService";

export default function VideoUpload() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    moduleTitle: "",
    lessonNumber: "",
    video: null,
  });

  const [uploading, setUploading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) =>
    setForm({ ...form, video: e.target.files[0] });

  const submit = async (e) => {
    e.preventDefault();

    if (!form.video) {
      alert("Please select a video file");
      return;
    }

    try {
      setUploading(true);

      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("moduleTitle", form.moduleTitle);
      fd.append("lessonNumber", form.lessonNumber);
      fd.append("video", form.video);
      fd.append("courseUuid", courseId);

      await videoService.uploadVideo(fd);

      alert("Video uploaded successfully ✅");
      navigate(`/admin/course/${courseId}/videos`);
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      alert("Video upload failed ❌");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.headerCard}>
        <div style={styles.headerContent}>
          <div style={styles.headerIconWrapper}>
            <svg style={styles.headerIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          <div>
            <h2 style={styles.title}>Upload New Video</h2>
            <p style={styles.subtitle}>
              Add a new lesson video to this course
            </p>
          </div>
        </div>
        <button
          type="button"
          style={styles.backBtn}
          onClick={() => navigate(`/admin/course/${courseId}/videos`)}
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
        <form onSubmit={submit} style={styles.form}>
          {/* Video Title */}
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
              name="title"
              placeholder="e.g. Course Introduction"
              onChange={handleChange}
              required
              style={styles.input}
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
                name="moduleTitle"
                placeholder="e.g. Introduction"
                onChange={handleChange}
                style={styles.input}
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
                name="lessonNumber"
                type="number"
                placeholder="1"
                onChange={handleChange}
                style={styles.input}
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
              name="description"
              placeholder="Short description about this lesson"
              onChange={handleChange}
              style={styles.textarea}
              className="form-input"
            />
          </div>

          {/* File Upload */}
          <div style={styles.field}>
            <label style={styles.label}>
              <svg style={styles.labelIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                <polyline points="13 2 13 9 20 9"/>
              </svg>
              Video File
              <span style={styles.required}>*</span>
            </label>
            
            <label style={styles.fileBox} className="file-upload-box">
              <input
                type="file"
                accept="video/mp4"
                onChange={handleFileChange}
                required
                style={styles.hiddenInput}
              />
              
              <div style={styles.uploadArea}>
                <div style={styles.uploadIconWrapper}>
                  <svg style={styles.uploadIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {form.video ? (
                      <>
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                      </>
                    ) : (
                      <>
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </>
                    )}
                  </svg>
                </div>
                
                {form.video ? (
                  <div style={styles.fileInfo}>
                    <p style={styles.fileName}>
                      <svg style={styles.fileNameIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="23 7 16 12 23 17 23 7"/>
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                      </svg>
                      {form.video.name}
                    </p>
                    <p style={styles.fileSize}>
                      Size: {(form.video.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <p style={styles.changeFile}>Click to change file</p>
                  </div>
                ) : (
                  <div style={styles.uploadPrompt}>
                    <p style={styles.uploadText}>
                      <strong>Click to upload</strong> or drag and drop
                    </p>
                    <p style={styles.uploadHint}>
                      MP4 video files only
                    </p>
                  </div>
                )}
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
                <strong>Upload Guidelines:</strong> Ensure your video is in MP4 format and under 500MB for optimal performance.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div style={styles.actions}>
            <button
              type="button"
              style={styles.cancelBtn}
              onClick={() =>
                navigate(`/admin/course/${courseId}/videos`)
              }
              disabled={uploading}
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
              disabled={uploading}
              className="submit-button"
            >
              {uploading ? (
                <>
                  <div style={styles.spinner}></div>
                  Uploading...
                </>
              ) : (
                <>
                  <svg style={styles.actionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Upload Video
                </>
              )}
            </button>
          </div>
        </form>
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

  headerCard: {
    maxWidth: "800px",
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
    maxWidth: "800px",
    margin: "0 auto",
    background: "#fff",
    padding: "40px",
    borderRadius: "20px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    border: "1px solid rgba(0,0,0,0.04)",
  },

  title: {
    margin: "0 0 6px 0",
    fontSize: "28px",
    fontWeight: "800",
    color: "#1e293b",
  },

  subtitle: {
    marginTop: "6px",
    marginBottom: 0,
    color: "#64748b",
    fontSize: "14px",
    fontWeight: "500",
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
    fontSize: "15px",
    minHeight: "120px",
    resize: "vertical",
    transition: "all 0.3s ease",
    outline: "none",
    fontFamily: "inherit",
    backgroundColor: "#f8fafc",
  },

  fileBox: {
    border: "3px dashed #cbd5e0",
    borderRadius: "16px",
    padding: "32px",
    background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "block",
  },

  hiddenInput: {
    display: "none",
  },

  uploadArea: {
    textAlign: "center",
  },

  uploadIconWrapper: {
    width: "80px",
    height: "80px",
    margin: "0 auto 20px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 24px rgba(102, 126, 234, 0.3)",
    transition: "all 0.3s ease",
  },

  uploadIcon: {
    width: "40px",
    height: "40px",
    color: "white",
  },

  uploadPrompt: {
    margin: 0,
  },

  uploadText: {
    fontSize: "16px",
    color: "#1e293b",
    margin: "0 0 8px 0",
  },

  uploadHint: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0,
  },

  fileInfo: {
    margin: 0,
  },

  fileName: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1e293b",
    margin: "0 0 8px 0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },

  fileNameIcon: {
    width: "20px",
    height: "20px",
    color: "#667eea",
  },

  fileSize: {
    fontSize: "14px",
    color: "#64748b",
    margin: "0 0 8px 0",
  },

  changeFile: {
    fontSize: "13px",
    color: "#667eea",
    margin: 0,
    fontWeight: "600",
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
    
    .file-upload-box:hover {
      border-color: #667eea !important;
      background: white !important;
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(102, 126, 234, 0.2) !important;
    }
    
    .file-upload-box:hover .upload-icon-wrapper {
      transform: scale(1.1) rotate(5deg);
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

