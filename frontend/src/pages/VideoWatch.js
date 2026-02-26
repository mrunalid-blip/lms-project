import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import videoService from "../services/videoService";
import VideoPlayer from "../components/VideoPlayer";
import NotesPanel from "../components/NotesPanel";
import BookmarksPanel from "../components/BookmarksPanel";
import Navbar from "../components/layout/Navbar";

function VideoWatch() {
  const { id } = useParams();
  const navigate = useNavigate();
  const playerRef = useRef(null);

  const [video, setVideo] = useState(null);
  const [progress, setProgress] = useState({
  lastPosition: 0,
  completed: false
});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [activeTab, setActiveTab] = useState("notes");
 
  const loadVideo = useCallback(async () => {
    try {
      const data = await videoService.getVideoById(id);
      setVideo(data.video);
      setProgress(data.progress);
      setCurrentTime(data.progress?.lastPosition || 0);
    } catch (err) {
      setError("Failed to load video");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadVideo();
  }, [loadVideo]);

  const handleTimeUpdate = (time) => {
    setCurrentTime(time);
  };

 const handleProgress = async (time) => {
  try {
    const res = await videoService.updateProgress(id, {
      lastPosition: time
    });

    // 🔥 SYNC UI WITH BACKEND
    if (res?.progress) {
      setProgress(res.progress);
    }
  } catch (err) {
    console.error("Failed to save progress:", err);
  }
};


  const handleSeek = (time) => {
    if (playerRef.current?.seekTo) {
      playerRef.current.seekTo(time);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={styles.loading}>
          <div style={styles.loader}></div>
          <p>Loading video...</p>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div>
        <Navbar />
        <div style={styles.error}>
          <div style={styles.errorIcon}>⚠️</div>
          <h2>Video Not Found</h2>
          <p>
            {error || "This video may have been removed or is unavailable."}
          </p>
          <button onClick={() => navigate("/videos")} style={styles.backButton}>
            ← Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const progressPercentage = progress?.completed
    ? 100
    : progress?.lastPosition && video.duration
      ? ((progress.lastPosition / video.duration) * 100).toFixed(0)
      : 0;

  return (
    <div style={styles.pageContainer}>
      <Navbar />

      {/* Breadcrumb */}
      <div style={styles.breadcrumb}>
        <div style={styles.container}>
          <button
            onClick={() => navigate("/videos")}
            style={styles.breadcrumbLink}
          >
            📚 My Courses
          </button>
          <span style={styles.breadcrumbSeparator}>/</span>
          <span style={styles.breadcrumbCurrent}>{video.title}</span>
        </div>
      </div>

      <div style={styles.container}>
        <div style={styles.layout}>
          {/* Main Content Area */}
          <div style={styles.mainContent}>
            {/* Video Player Card */}
            <div style={styles.playerCard}>
      <VideoPlayer
  videoUrl={videoService.getStreamUrl(video._id)} // ✅ STREAM API
  allowDownload={video.allowDownload}             // ✅ ADMIN CONTROL
  onTimeUpdate={handleTimeUpdate}
  initialTime={progress?.lastPosition || 0}
  onProgress={handleProgress}
/>


            </div>

            {/* Video Info Section */}
            <div style={styles.infoCard}>
              <div style={styles.infoHeader}>
                <div>
                  <h1 style={styles.videoTitle}>{video.title}</h1>
                  <div style={styles.metaInfo}>
                    <span style={styles.metaItem}>
                      👤 Dr. {video.uploadedBy?.fullName || "Unknown"}
                    </span>
                    <span style={styles.metaDot}>•</span>
                    <span style={styles.metaItem}>
                      👥 234 students enrolled
                    </span>
                    <span style={styles.metaDot}>•</span>
                    <span style={styles.metaItem}>⭐ 4.8 rating</span>
                  </div>
                </div>
                {video.forceWatch && (
                  <div style={styles.sequentialBadge}>
                    🔒 Sequential Watch Required
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div style={styles.progressSection}>
                <div style={styles.progressHeader}>
                  <span style={styles.progressLabel}>Your Progress</span>
                  <span style={styles.progressPercentage}>
                    {progressPercentage}%
                  </span>
                </div>
                <div style={styles.progressBar}>
                  <div
                    style={{
                      ...styles.progressFill,
                      width: `${progressPercentage}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Description */}
              <div style={styles.descriptionSection}>
                <h3 style={styles.sectionTitle}>About this course</h3>
                <p style={styles.description}>{video.description}</p>
              </div>

              {/* Course Features */}
              <div style={styles.featuresSection}>
                <h3 style={styles.sectionTitle}>What you'll learn</h3>
                <div style={styles.featuresGrid}>
                  <div style={styles.featureItem}>
                    <span style={styles.featureIcon}>✓</span>
                    <span>Comprehensive medical concepts</span>
                  </div>
                  <div style={styles.featureItem}>
                    <span style={styles.featureIcon}>✓</span>
                    <span>Real-world case studies</span>
                  </div>
                  <div style={styles.featureItem}>
                    <span style={styles.featureIcon}>✓</span>
                    <span>Evidence-based practices</span>
                  </div>
                  <div style={styles.featureItem}>
                    <span style={styles.featureIcon}>✓</span>
                    <span>Clinical applications</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={styles.sidebar}>
            {/* Study Tools Card */}
            <div style={styles.sidebarCard}>
              <div style={styles.tabsContainer}>
                <button
                  style={activeTab === "notes" ? styles.tabActive : styles.tab}
                  onClick={() => setActiveTab("notes")}
                >
                  <span style={styles.tabIcon}>📝</span>
                  Notes
                </button>
                <button
                  style={
                    activeTab === "bookmarks" ? styles.tabActive : styles.tab
                  }
                  onClick={() => setActiveTab("bookmarks")}
                >
                  <span style={styles.tabIcon}>🔖</span>
                  Bookmarks
                </button>
              </div>

              <div style={styles.tabContent}>
                {activeTab === "notes" && (
                  <NotesPanel
                    videoId={id}
                    currentTime={currentTime}
                    onSeek={handleSeek}
                  />
                )}
                {activeTab === "bookmarks" && (
                  <BookmarksPanel
                    videoId={id}
                    currentTime={currentTime}
                    onSeek={handleSeek}
                  />
                )}
              </div>
            </div>

            {/* Quick Actions Card */}
            <div style={styles.quickActionsCard}>
              <h4 style={styles.quickActionsTitle}>Quick Actions</h4>
              <button style={styles.actionButton}>📥 Download Resources</button>
              <button style={styles.actionButton}>📊 View Certificate</button>
              <button style={styles.actionButton}>💬 Ask Question</button>
              <button style={styles.actionButtonSecondary}>
                ⚙️ Course Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    minHeight: "100vh",
    backgroundColor: "#f8f9fa",
  },
  breadcrumb: {
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e0e0e0",
    padding: "15px 0",
  },
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "0 30px",
  },
  breadcrumbLink: {
    background: "none",
    border: "none",
    color: "#0066cc",
    cursor: "pointer",
    fontSize: "14px",
    padding: 0,
    fontWeight: "500",
  },
  breadcrumbSeparator: {
    margin: "0 10px",
    color: "#7f8c8d",
  },
  breadcrumbCurrent: {
    color: "#2c3e50",
    fontSize: "14px",
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "1fr 400px",
    gap: "25px",
    padding: "25px 0",
  },
  mainContent: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  playerCard: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  infoCard: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "30px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  infoHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "25px",
    paddingBottom: "20px",
    borderBottom: "1px solid #e0e0e0",
  },
  videoTitle: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: "12px",
    lineHeight: "1.3",
  },
  metaInfo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },
  metaItem: {
    fontSize: "14px",
    color: "#7f8c8d",
  },
  metaDot: {
    color: "#e0e0e0",
  },
  sequentialBadge: {
    padding: "10px 16px",
    backgroundColor: "#fff3cd",
    color: "#856404",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },
  progressSection: {
    marginBottom: "30px",
    padding: "20px",
    backgroundColor: "#f8f9fa",
    borderRadius: "12px",
  },
  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  progressLabel: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#2c3e50",
  },
  progressPercentage: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#0066cc",
  },
  progressBar: {
    height: "10px",
    backgroundColor: "#e0e0e0",
    borderRadius: "10px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #0066cc 0%, #00a896 100%)",
    borderRadius: "10px",
    transition: "width 0.5s ease",
  },
  descriptionSection: {
    marginBottom: "30px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: "15px",
  },
  description: {
    fontSize: "15px",
    color: "#7f8c8d",
    lineHeight: "1.8",
  },
  featuresSection: {
    marginTop: "30px",
    paddingTop: "30px",
    borderTop: "1px solid #e0e0e0",
  },
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "15px",
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "14px",
    color: "#2c3e50",
  },
  featureIcon: {
    color: "#00a896",
    fontWeight: "700",
    fontSize: "18px",
  },
  sidebar: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  sidebarCard: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  tabsContainer: {
    display: "flex",
    borderBottom: "2px solid #e0e0e0",
    backgroundColor: "#f8f9fa",
  },
  tab: {
    flex: 1,
    padding: "16px",
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    color: "#7f8c8d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "all 0.3s",
  },
  tabActive: {
    flex: 1,
    padding: "16px",
    border: "none",
    backgroundColor: "#ffffff",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    color: "#0066cc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    borderBottom: "3px solid #0066cc",
  },
  tabIcon: {
    fontSize: "18px",
  },
  tabContent: {
    padding: 0,
  },
  quickActionsCard: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  quickActionsTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: "15px",
  },
  actionButton: {
    width: "100%",
    padding: "12px 16px",
    border: "none",
    backgroundColor: "#f8f9fa",
    color: "#2c3e50",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "10px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    transition: "all 0.3s",
  },
  actionButtonSecondary: {
    width: "100%",
    padding: "12px 16px",
    border: "1px solid #e0e0e0",
    backgroundColor: "transparent",
    color: "#7f8c8d",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    transition: "all 0.3s",
  },
  loading: {
    textAlign: "center",
    padding: "80px 20px",
  },
  loader: {
    width: "50px",
    height: "50px",
    border: "5px solid #e0e0e0",
    borderTop: "5px solid #0066cc",
    borderRadius: "50%",
    margin: "0 auto 20px",
    animation: "spin 1s linear infinite",
  },
  error: {
    textAlign: "center",
    padding: "80px 20px",
  },
  errorIcon: {
    fontSize: "64px",
    marginBottom: "20px",
  },
  backButton: {
    marginTop: "20px",
    padding: "12px 24px",
    backgroundColor: "#0066cc",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
  },
};

export default VideoWatch;
