import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import videoService from "../../services/videoService";

export default function VideoList() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    if (courseId) loadVideos();
  }, [courseId]);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const res = await videoService.getVideosByCourse(courseId);
      setVideos(res.videos || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load videos");
    } finally {
      setLoading(false);
    }
  };

  const deleteVideo = async (id) => {
    if (!window.confirm("Delete this video permanently?")) return;

    try {
      await videoService.deleteVideo(id);
      loadVideos();
    } catch (err) {
      console.error(err);
      alert("Failed to delete video");
    }
  };
  const toggleDownload = async (video) => {
    try {
      const res = await videoService.toggleDownload(
        video._id,
        !video.allowDownload,
      );

      // 🔄 Update UI locally
      setVideos((prev) =>
        prev.map((v) =>
          v._id === video._id ? { ...v, allowDownload: res.allowDownload } : v,
        ),
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update download setting");
    }
  };
  const toggleWatchRestriction = async (video) => {
  try {
    const res = await videoService.toggleWatchRestriction(
      video._id,
      !video.requireWatchPercentage
    );

    setVideos((prev) =>
      prev.map((v) =>
        v._id === video._id
          ? {
              ...v,
              requireWatchPercentage: res.requireWatchPercentage,
              minimumWatchPercent: res.minimumWatchPercent,
            }
          : v
      )
    );
  } catch (err) {
    console.error(err);
    alert("Failed to update watch restriction");
  }
};


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
            <h2 style={styles.title}>Course Videos</h2>
            <p style={styles.subtitle}>{videos.length} video(s) in this course</p>
          </div>
        </div>

        <button
          style={styles.uploadBtn}
          onClick={() => navigate(`/admin/course/${courseId}/upload`)}
          className="upload-button"
        >
          <svg style={styles.buttonIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Upload Video
        </button>
      </div>

      {/* Stats Bar */}
      <div style={styles.statsBar}>
        <div style={styles.statCard}>
          <svg style={styles.statIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="23 7 16 12 23 17 23 7"/>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
          </svg>
          <div>
            <div style={styles.statNumber}>{videos.length}</div>
            <div style={styles.statLabel}>Total Videos</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <svg style={styles.statIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          <div>
            <div style={styles.statNumber}>
              {videos.filter(v => v.allowDownload).length}
            </div>
            <div style={styles.statLabel}>Downloadable</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <svg style={styles.statIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
          <div>
            <div style={styles.statNumber}>
              {new Set(videos.map(v => v.moduleTitle).filter(Boolean)).size}
            </div>
            <div style={styles.statLabel}>Modules</div>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={styles.loading}>
          <div style={styles.loader}></div>
          <p style={styles.loadingText}>Loading videos...</p>
        </div>
      )}

      {/* Empty */}
      {!loading && videos.length === 0 && (
        <div style={styles.empty}>
          <div style={styles.emptyIconWrapper}>
            <svg style={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="23 7 16 12 23 17 23 7"/>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
          </div>
          <h3 style={styles.emptyTitle}>No videos uploaded yet</h3>
          <p style={styles.emptyText}>Click "Upload Video" to add your first video to this course</p>
        </div>
      )}

      {/* Video Table */}
      {!loading && videos.length > 0 && (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.tableHeader}>#</th>
                <th style={{...styles.tableHeader, textAlign: 'left'}}>Title</th>
                <th style={styles.tableHeader}>Module</th>
                <th style={styles.tableHeader}>Lesson</th>
                <th style={styles.tableHeader}>Download</th>
                <th style={styles.tableHeader}>80% Required</th>

                <th style={styles.tableHeader}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {videos.map((v, index) => (
                <tr key={v._id} style={styles.tableRow} className="table-row">
                  <td style={styles.tableCell}>
                    <div style={styles.indexBadge}>{index + 1}</div>
                  </td>
                  <td style={{...styles.tableCell, textAlign: 'left'}}>
                    <div style={styles.videoTitleCell}>
                      <div style={styles.videoIconWrapper}>
                        <svg style={styles.videoIcon} viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="5 3 19 12 5 21 5 3"/>
                        </svg>
                      </div>
                      <span style={styles.videoTitle}>{v.title}</span>
                    </div>
                  </td>
                  <td style={styles.tableCell}>
                    {v.moduleTitle ? (
                      <div style={styles.moduleBadge}>
                        <svg style={styles.moduleBadgeIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                        </svg>
                        {v.moduleTitle}
                      </div>
                    ) : (
                      <span style={styles.emptyValue}>-</span>
                    )}
                  </td>
                  <td style={styles.tableCell}>
                    {v.lessonNumber ? (
                      <div style={styles.lessonBadge}>{v.lessonNumber}</div>
                    ) : (
                      <span style={styles.emptyValue}>-</span>
                    )}
                  </td>
                  <td style={styles.tableCell}>
                    <button
                      onClick={() => toggleDownload(v)}
                      style={{
                        ...styles.downloadToggle,
                        background: v.allowDownload 
                          ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'
                          : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                        color: v.allowDownload ? '#065f46' : '#991b1b',
                        border: v.allowDownload ? '2px solid #86efac' : '2px solid #fca5a5',
                      }}
                      className="download-toggle"
                    >
                      <svg style={styles.toggleIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {v.allowDownload ? (
                          <polyline points="20 6 9 17 4 12"/>
                        ) : (
                          <>
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                          </>
                        )}
                      </svg>
                      {v.allowDownload ? "Enabled" : "Disabled"}
                    </button>
                  </td>
                  <td style={styles.tableCell}>
  <button
    onClick={() => toggleWatchRestriction(v)}
    style={{
      ...styles.downloadToggle,
      background: v.requireWatchPercentage
        ? 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)'
        : 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
      color: v.requireWatchPercentage ? '#991b1b' : '#065f46',
      border: v.requireWatchPercentage
        ? '2px solid #fca5a5'
        : '2px solid #86efac',
    }}
  >
    <svg
      style={styles.toggleIcon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      {v.requireWatchPercentage ? (
        <polyline points="20 6 9 17 4 12" />
      ) : (
        <>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </>
      )}
    </svg>
    {v.requireWatchPercentage ? "Enabled" : "Disabled"}
  </button>

  {v.requireWatchPercentage && (
    <div style={{ fontSize: "11px", marginTop: "4px", color: "#991b1b" }}>
      Must watch {v.minimumWatchPercent || 80}%
    </div>
  )}
</td>


                  <td style={styles.tableCell}>
                    <div style={styles.actions}>
                      <button
                        style={styles.viewBtn}
                        onClick={() => setSelectedVideo(v)}
                        className="action-button view-button"
                        title="View video"
                      >
                        <svg style={styles.actionIcon} viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="5 3 19 12 5 21 5 3"/>
                        </svg>
                      </button>

                      <button
                        style={styles.editBtn}
                        onClick={() => navigate(`/admin/videos/${v._id}/edit`)}
                        className="action-button edit-button"
                        title="Edit video"
                      >
                        <svg style={styles.actionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>

                      <button
                        style={styles.deleteBtn}
                        onClick={() => deleteVideo(v._id)}
                        className="action-button delete-button"
                        title="Delete video"
                      >
                        <svg style={styles.actionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          <line x1="10" y1="11" x2="10" y2="17"/>
                          <line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Video Preview Modal */}
      {selectedVideo && (
        <div style={styles.modalBackdrop} onClick={() => setSelectedVideo(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalHeaderLeft}>
                <div style={styles.modalIconWrapper}>
                  <svg style={styles.modalIcon} viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                </div>
                <h3 style={styles.modalTitle}>{selectedVideo.title}</h3>
              </div>
              <button 
                style={styles.modalCloseBtn}
                onClick={() => setSelectedVideo(null)}
                className="close-button"
              >
                <svg style={styles.closeIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div style={styles.videoWrapper}>
              <video
                src={videoService.getStreamUrl(selectedVideo._id)}
                controls
                style={styles.video}
              />
            </div>

            <div style={styles.modalFooter}>
              <div style={styles.videoInfo}>
                {selectedVideo.moduleTitle && (
                  <div style={styles.infoItem}>
                    <svg style={styles.infoIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                    </svg>
                    <span>Module: {selectedVideo.moduleTitle}</span>
                  </div>
                )}
                {selectedVideo.lessonNumber && (
                  <div style={styles.infoItem}>
                    <svg style={styles.infoIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <span>Lesson: {selectedVideo.lessonNumber}</span>
                  </div>
                )}
              </div>
              <button 
                style={styles.modalActionBtn}
                onClick={() => setSelectedVideo(null)}
                className="modal-action-button"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= STYLES ================= */

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

  uploadBtn: {
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
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "32px",
  },

  statCard: {
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
    minHeight: "50vh",
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

  tableContainer: {
    background: "white",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    border: "1px solid rgba(0,0,0,0.04)",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  tableHeaderRow: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },

  tableHeader: {
    padding: "20px 16px",
    textAlign: "center",
    color: "white",
    fontWeight: "700",
    fontSize: "14px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  tableRow: {
    borderBottom: "1px solid #f1f5f9",
    transition: "all 0.3s ease",
  },

  tableCell: {
    padding: "20px 16px",
    textAlign: "center",
    fontSize: "14px",
    color: "#64748b",
  },

  indexBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    borderRadius: "10px",
    fontWeight: "700",
    color: "#667eea",
    border: "2px solid #e2e8f0",
  },

  videoTitleCell: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  videoIconWrapper: {
    width: "36px",
    height: "36px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  videoIcon: {
    width: "14px",
    height: "14px",
    color: "white",
  },

  videoTitle: {
    fontWeight: "600",
    color: "#1e293b",
  },

  moduleBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
    borderRadius: "50px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#92400e",
    border: "1px solid #fbbf24",
  },

  moduleBadgeIcon: {
    width: "14px",
    height: "14px",
  },

  lessonBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "6px 14px",
    background: "linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%)",
    borderRadius: "50px",
    fontSize: "13px",
    fontWeight: "700",
    color: "#5b21b6",
    border: "1px solid #a78bfa",
  },

  emptyValue: {
    color: "#cbd5e0",
    fontStyle: "italic",
  },

  downloadToggle: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 14px",
    borderRadius: "50px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "700",
    transition: "all 0.3s ease",
  },

  toggleIcon: {
    width: "16px",
    height: "16px",
  },

  actions: {
    display: "flex",
    gap: "8px",
    justifyContent: "center",
  },

  viewBtn: {
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "#fff",
    border: "none",
    padding: "10px",
    borderRadius: "10px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
  },

  editBtn: {
    background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    border: "2px solid #e2e8f0",
    padding: "10px",
    borderRadius: "10px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",
  },

  deleteBtn: {
    background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
    color: "#ef4444",
    border: "2px solid #fca5a5",
    padding: "10px",
    borderRadius: "10px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",
  },

  actionIcon: {
    width: "16px",
    height: "16px",
  },

  modalBackdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
    animation: "fadeIn 0.2s ease-out",
  },

  modal: {
    background: "white",
    borderRadius: "24px",
    width: "90%",
    maxWidth: "900px",
    maxHeight: "90vh",
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    animation: "slideUp 0.3s ease-out",
  },

  modalHeader: {
    padding: "24px 32px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  modalHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    flex: 1,
  },

  modalIconWrapper: {
    width: "48px",
    height: "48px",
    background: "rgba(255, 255, 255, 0.2)",
    backdropFilter: "blur(10px)",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid rgba(255, 255, 255, 0.3)",
  },

  modalIcon: {
    width: "20px",
    height: "20px",
    color: "white",
  },

  modalTitle: {
    margin: 0,
    color: "white",
    fontSize: "22px",
    fontWeight: "700",
  },

  modalCloseBtn: {
    width: "40px",
    height: "40px",
    background: "rgba(255, 255, 255, 0.2)",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },

  closeIcon: {
    width: "20px",
    height: "20px",
    color: "white",
  },

  videoWrapper: {
    padding: "32px",
    background: "#000",
  },

  video: {
    width: "100%",
    borderRadius: "12px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
  },

  modalFooter: {
    padding: "24px 32px",
    background: "#f8fafc",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid #e2e8f0",
  },

  videoInfo: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
  },

  infoItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    color: "#64748b",
    fontWeight: "500",
  },

  infoIcon: {
    width: "16px",
    height: "16px",
    color: "#667eea",
  },

  modalActionBtn: {
    padding: "12px 28px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
  },
};

// Add keyframe animations and hover effects via a style tag
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideUp {
      from { 
        opacity: 0;
        transform: translateY(30px);
      }
      to { 
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .upload-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4) !important;
    }
    
    .table-row:hover {
      background: #f8fafc !important;
    }
    
    .download-toggle:hover {
      transform: scale(1.05);
    }
    
    .action-button:hover {
      transform: scale(1.1);
    }
    
    .view-button:hover {
      box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4) !important;
    }
    
    .edit-button:hover {
      border-color: #cbd5e0 !important;
    }
    
    .delete-button:hover {
      background: linear-gradient(135deg, #fecaca 0%, #f87171 100%) !important;
      border-color: #f87171 !important;
    }
    
    .close-button:hover {
      background: rgba(255, 255, 255, 0.3) !important;
      transform: rotate(90deg);
    }
    
    .modal-action-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4) !important;
    }
  `;
  document.head.appendChild(styleSheet);
}

