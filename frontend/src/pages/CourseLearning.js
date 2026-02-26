import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import courseService from "../services/courseService";
import videoService from "../services/videoService";
import Navbar from "../components/layout/Navbar";
import styles from "./CourseLearning.module.css";
import VideoPlayer from "../components/VideoPlayer";
import VideoControls from "../components/video/VideoControls";
import bookmarkService from "../services/bookmarkService";
import noteService from "../services/noteService";
import commentService from "../services/commentService";
import VideoBottomTabs from "../components/video/VideoBottomTabs";
import reactionService from "../services/reactionService";
import VoiceAssistant from "../components/assistant/VoiceAssistant";

function CourseLearning() {
  const { uuid }   = useParams();
  const navigate   = useNavigate();

  // ── Player ref — gives direct access to seekTo / changeQuality ──
  const playerRef = useRef(null);
  

  const [course,           setCourse]           = useState(null);
  const [videos,           setVideos]           = useState([]);
  const [selectedVideo,    setSelectedVideo]    = useState(null);
  const [loading,          setLoading]          = useState(true);
  const [sidebarOpen,      setSidebarOpen]      = useState(true);
  const [completedLessons, setCompletedLessons] = useState(new Set());

  const [notes,            setNotes]            = useState("");
  const [videoNotes,       setVideoNotes]       = useState([]);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(false);
  const [bookmarked,       setBookmarked]       = useState(false);
  const [currentTime,      setCurrentTime]      = useState(0);
  const [bookmarks,        setBookmarks]        = useState([]);
  const [activeBottomTab,  setActiveBottomTab]  = useState("comments");
  const [comments,         setComments]         = useState([]);
  const [likes,            setLikes]            = useState(0);
  const [dislikes,         setDislikes]         = useState(0);
  const [myReaction,       setMyReaction]       = useState(null);
  const [realDurations,    setRealDurations]    = useState({});
  const [watchPercentage,  setWatchPercentage]  = useState(0);
  const [initialTime,      setInitialTime]      = useState(0);

  const bottomTabsRef = useRef(null);

  // ─── Load course + videos ─────────────────────────────────────────

  useEffect(() => { loadCourseData(); }, [uuid]);

  const loadCourseData = async () => {
    try {
      const courseData   = await courseService.getCourseById(uuid);
      setCourse(courseData.course);

      const videosData   = await videoService.getVideosByCourse(courseData.course.uuid);
      const videoList    = videosData.videos || [];
      setVideos(videoList);

      const progressRes  = await videoService.getAllProgress();
      const progressList = progressRes.progressList || [];

      setCompletedLessons(
        new Set(
          progressList
            .filter(
              (p) =>
                p.videoId &&
                p.completed &&
                videoList.some((v) => v._id === p.videoId._id)
            )
            .map((p) => p.videoId._id)
        )
      );

      if (videoList.length) {
        setSelectedVideo(videoList[0]);
        const firstProgress = progressList.find(
          (p) => p.videoId?._id === videoList[0]._id
        );
        setInitialTime(firstProgress?.lastPosition || 0);
      }
    } catch (err) {
      console.error("Error loading course:", err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Receive real video duration from VideoPlayer ─────────────────

  useEffect(() => {
    const handler = (e) => {
      if (!selectedVideo) return;
      setRealDurations((prev) => ({ ...prev, [selectedVideo._id]: e.detail }));
    };
    window.addEventListener("video-duration", handler);
    return () => window.removeEventListener("video-duration", handler);
  }, [selectedVideo]);

  // ─── Load per-video data when selection changes ───────────────────

  useEffect(() => {
    if (!selectedVideo) return;
    bookmarkService
      .getBookmarks(selectedVideo._id)
      .then((res) => {
        setBookmarks(res.bookmarks || []);
        setBookmarked((res.bookmarks || []).length > 0);
      })
      .catch((err) => console.error("Failed to load bookmarks", err));
  }, [selectedVideo]);

  useEffect(() => {
    if (!selectedVideo) return;
    noteService
      .getNotes(selectedVideo._id)
      .then((res) => setVideoNotes(res.notes || []))
      .catch((err) => console.error("Failed to load notes", err));
  }, [selectedVideo]);

  useEffect(() => {
    if (!selectedVideo) return;
    commentService
      .getComments(selectedVideo._id)
      .then((res) => setComments(res.comments || []))
      .catch((err) => console.error("Failed to load comments", err));
  }, [selectedVideo]);

  useEffect(() => {
    if (!selectedVideo) return;
    const load = async () => {
      try {
        const countRes = await reactionService.getCounts(selectedVideo._id);
        setLikes(countRes.likes);
        setDislikes(countRes.dislikes);
        try {
          const myRes = await reactionService.getMyReaction(selectedVideo._id);
          setMyReaction(myRes.reaction);
        } catch {
          setMyReaction(null);
        }
      } catch (err) {
        console.error("Failed to load reactions", err);
      }
    };
    load();
  }, [selectedVideo]);

  // ─── Helpers ──────────────────────────────────────────────────────

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // ─── Video selection ──────────────────────────────────────────────

  const handleVideoSelect = async (video) => {
    setSelectedVideo(video);
    setNotes("");
    setWatchPercentage(0);
    setCurrentTime(0);

    try {
      const res = await videoService.getVideoById(video._id);
      setInitialTime(res.progress?.lastPosition || 0);
    } catch {
      setInitialTime(0);
    }
  };

  // ─── Mark lesson complete ─────────────────────────────────────────

  const markLessonComplete = async (video) => {
    try {
      if (
        video.requireWatchPercentage &&
        watchPercentage < (video.minimumWatchPercent || 80)
      ) {
        alert(
          `You must watch at least ${video.minimumWatchPercent || 80}% to complete this lesson`
        );
        return;
      }

      await videoService.markVideoComplete(video._id);
      setCompletedLessons((prev) => new Set([...prev, video._id]));
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to mark complete");
    }
  };

  // ─── Progress update from player ─────────────────────────────────

  const handleProgress = (time) => {
    setCurrentTime(time);

    const duration = realDurations[selectedVideo._id] || selectedVideo?.duration;
    if (!duration || isNaN(duration) || duration <= 0) return;

    setWatchPercentage((time / duration) * 100);

    videoService
      .updateProgress(selectedVideo._id, { currentTime: time, duration })
      .catch((err) => console.error("Progress save failed:", err));
  };

  // ─── Bookmark click — seeks via ref ──────────────────────────────

  const handleBookmarkClick = (timestampSeconds) => {
    // playerRef.current.seekTo() is defined in VideoPlayer via
    // useImperativeHandle — no undefined ref errors possible here
    playerRef.current?.seekTo(timestampSeconds);
    playerRef.current?.scrollIntoView();
  };

  const handleCreateBookmark = async () => {
    try {
      const res = await bookmarkService.createBookmark(selectedVideo._id, {
        timestampSeconds: currentTime,
        label: `Bookmark at ${formatTime(currentTime)}`,
      });
      setBookmarks((prev) => [...prev, res.bookmark]);
      setBookmarked(true);
      alert("Bookmark created!");
    } catch (err) {
      console.error("Bookmark failed", err);
    }
  };

  // ─── Download ─────────────────────────────────────────────────────

  const handleDownload = async () => {
    if (!localStorage.getItem("token")) {
      alert("Please login to download");
      return;
    }
    try {
      const response = await videoService.downloadVideo(selectedVideo._id);
      const url      = window.URL.createObjectURL(new Blob([response.data]));
      const link     = document.createElement("a");
      link.href      = url;
      link.setAttribute(
        "download",
        `${selectedVideo.title.replace(/[^a-z0-9]/gi, "_")}.mp4`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err?.response?.data?.error || "Download failed");
    }
  };

  // ─── Notes ────────────────────────────────────────────────────────

  const handleAddNote = () => {
    setActiveBottomTab("notes");
    setNotes(`Note at ${formatTime(currentTime)}: `);
    setTimeout(() => {
      bottomTabsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleCreateNote = async () => {
    if (!notes.trim()) { alert("Note cannot be empty"); return; }
    try {
      const res = await noteService.createNote(selectedVideo._id, {
        timestampSeconds: currentTime,
        noteText: notes,
      });
      setVideoNotes((prev) => [...prev, res.note]);
      setNotes("");
    } catch (err) {
      console.error("Failed to create note", err);
    }
  };

  // ─── Comments ─────────────────────────────────────────────────────

  const handlePostComment = async (commentText) => {
    if (!commentText.trim()) return;
    try {
      const res = await commentService.createComment(selectedVideo._id, commentText);
      setComments((prev) => [res.comment, ...prev]);
    } catch (err) {
      console.error("Failed to post comment", err);
    }
  };

  // ─── Reactions ────────────────────────────────────────────────────

  const handleReaction = async (reaction) => {
    if (!localStorage.getItem("token")) return;
    try {
      const res         = await reactionService.react(selectedVideo._id, reaction);
      const newReaction = res.reaction;

      if (myReaction === "like")     setLikes((v) => v - 1);
      if (myReaction === "dislike")  setDislikes((v) => v - 1);
      if (newReaction === "like")    setLikes((v) => v + 1);
      if (newReaction === "dislike") setDislikes((v) => v + 1);

      setMyReaction(newReaction);
    } catch (err) {
      if (err?.response?.status === 401) return;
      console.error("Reaction failed", err);
    }
  };

  // ─── Derived values ───────────────────────────────────────────────

  const calculateProgress = () => {
    if (!videos.length) return 0;
    return Math.round((completedLessons.size / videos.length) * 100);
  };

  const groupVideosByModule = () =>
    videos.reduce((acc, video) => {
      const mod = video.moduleTitle || "General";
      if (!acc[mod]) acc[mod] = [];
      acc[mod].push(video);
      return acc;
    }, {});

  // ─── Loading state ────────────────────────────────────────────────

  if (loading) {
    return (
      <div className={styles.container}>
        <Navbar />
        <div className={styles.loading}>
          <div className={styles.loaderRing}>
            <div /><div /><div /><div />
          </div>
          <p className={styles.loadingText}>Loading course...</p>
        </div>
      </div>
    );
  }

  const groupedVideos = groupVideosByModule();
  const progress      = calculateProgress();

  // ─── Render ───────────────────────────────────────────────────────

  return (
    <div className={styles.container}>
      <Navbar />

      {/* ── Top bar ── */}
      <div className={styles.topBar}>
        <button onClick={() => navigate("/videos")} className={styles.backButton}>
          <svg className={styles.backIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          <span>Back to Dashboard</span>
        </button>

        <div className={styles.courseInfo}>
          <div className={styles.courseHeader}>
            <svg className={styles.courseIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
            <h1 className={styles.courseName}>{course?.course_name}</h1>
          </div>
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }}>
                <div className={styles.progressShine} />
              </div>
            </div>
            <div className={styles.progressStats}>
              <svg className={styles.progressIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <span className={styles.progressText}>{progress}% Complete</span>
              <span className={styles.progressCount}>
                ({completedLessons.size}/{videos.length} lessons)
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={styles.toggleButton}
          title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
        >
          <svg className={styles.toggleIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {sidebarOpen
              ? <polyline points="9 18 15 12 9 6"/>
              : <polyline points="15 18 9 12 15 6"/>}
          </svg>
        </button>
      </div>

      {/* ── Main layout ── */}
      <div className={styles.mainContent}>
        <div className={styles.playerSection}>
          <div className={styles.videoPlayer}>
            {selectedVideo ? (
              selectedVideo.videoUrl ? (
                <div className={styles.videoWrapper}>
                  {/* ref={playerRef} wires useImperativeHandle so
                      handleBookmarkClick can call playerRef.current.seekTo() */}
                  <VideoPlayer
                    ref={playerRef}
                    videoUrl={videoService.getStreamUrl(selectedVideo._id)}
                    allowDownload={selectedVideo.allowDownload}
                    restrictForwardSeek={selectedVideo.requireWatchPercentage}
                    initialTime={initialTime}
                    onProgress={handleProgress}
                  />

                  <VideoControls
                    bookmarked={bookmarked}
                    subtitlesEnabled={subtitlesEnabled}
                    onToggleSubtitles={() => setSubtitlesEnabled((p) => !p)}
                    onBookmark={handleCreateBookmark}
                    onAddNote={handleAddNote}
                    allowDownload={selectedVideo.allowDownload}
                    onDownload={handleDownload}
                  />
                </div>
              ) : (
                <div className={styles.videoPlaceholder}>
                  <div className={styles.playIconWrapper}>
                    <svg className={styles.playIcon} viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                  </div>
                  <h2 className={styles.videoTitle}>{selectedVideo.title}</h2>
                  <p className={styles.videoSubtitle}>
                    {selectedVideo.status === "processing"
                      ? "⏳ Video is still being transcoded…"
                      : "Video URL not available"}
                  </p>
                </div>
              )
            ) : (
              <div className={styles.noVideo}>
                <div className={styles.noVideoIconWrapper}>
                  <svg className={styles.noVideoIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </svg>
                </div>
                <p className={styles.noVideoText}>Select a lesson to begin</p>
              </div>
            )}
          </div>

          {/* ── Video details panel ── */}
          {selectedVideo && (
            <div className={styles.videoDetails}>
              <div className={styles.videoHeader}>
                <div className={styles.videoHeaderLeft}>
                  <div className={styles.videoTitleRow}>
                    <h2 className={styles.videoTitleLarge}>{selectedVideo.title}</h2>
                    {selectedVideo.moduleTitle && (
                      <span className={styles.moduleBadge}>
                        <svg className={styles.moduleBadgeIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                        </svg>
                        {selectedVideo.moduleTitle}
                      </span>
                    )}
                  </div>
                  <p className={styles.videoDescription}>
                    {selectedVideo.description || "No description available"}
                  </p>

                  {/* Reaction bar */}
                  <div className={styles.reactionBar}>
                    <button
                      className={`${styles.reactionBtn} ${myReaction === "like" ? styles.likeActive : ""}`}
                      onClick={() => handleReaction("like")}
                    >
                      <svg className={styles.reactionIcon} viewBox="0 0 24 24"
                        fill={myReaction === "like" ? "currentColor" : "none"}
                        stroke="currentColor" strokeWidth="2">
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                      </svg>
                      <span className={styles.reactionCount}>{likes}</span>
                    </button>

                    <button
                      className={`${styles.reactionBtn} ${myReaction === "dislike" ? styles.dislikeActive : ""}`}
                      onClick={() => handleReaction("dislike")}
                    >
                      <svg className={styles.reactionIcon} viewBox="0 0 24 24"
                        fill={myReaction === "dislike" ? "currentColor" : "none"}
                        stroke="currentColor" strokeWidth="2">
                        <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
                      </svg>
                      <span className={styles.reactionCount}>{dislikes}</span>
                    </button>
                  </div>
                </div>

                {/* Mark Complete button */}
                <button
                  onClick={() => markLessonComplete(selectedVideo)}
                  disabled={
                    completedLessons.has(selectedVideo._id) ||
                    (selectedVideo.requireWatchPercentage &&
                      watchPercentage < (selectedVideo.minimumWatchPercent || 80))
                  }
                  className={
                    completedLessons.has(selectedVideo._id)
                      ? styles.completeButtonActive
                      : selectedVideo.requireWatchPercentage &&
                        watchPercentage < (selectedVideo.minimumWatchPercent || 80)
                      ? styles.completeButtonDisabled
                      : styles.completeButton
                  }
                >
                  {completedLessons.has(selectedVideo._id) ? (
                    <>
                      <svg className={styles.completeIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Completed
                    </>
                  ) : (
                    <>
                      <svg className={styles.completeIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                      Mark Complete
                      {selectedVideo.requireWatchPercentage && (
                        <span className={styles.watchPercent}>
                          ({Math.round(watchPercentage)}%
                          / {selectedVideo.minimumWatchPercent || 80}%)
                        </span>
                      )}
                    </>
                  )}
                </button>
              </div>

              {/* Bottom tabs */}
              <div ref={bottomTabsRef}>
                <VideoBottomTabs
                  overview={
                    selectedVideo.description ||
                    "This lesson covers important concepts in medical education."
                  }
                  notes={notes}
                  onNotesChange={setNotes}
                  onCreateNote={handleCreateNote}
                  bookmarks={bookmarks}
                  onBookmarkClick={handleBookmarkClick}
                  onCreateBookmark={handleCreateBookmark}
                  videoNotes={videoNotes}
                  comments={comments}
                  onCreateComment={handlePostComment}
                  activeTab={activeBottomTab}
                  onTabChange={setActiveBottomTab}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        {sidebarOpen && (
          <div className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
              <div className={styles.sidebarHeaderTop}>
                <svg className={styles.sidebarHeaderIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
                <h3 className={styles.sidebarTitle}>Course Content</h3>
              </div>
              <span className={styles.lessonCount}>
                <svg className={styles.lessonCountIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {completedLessons.size}/{videos.length}
              </span>
            </div>

            <div className={styles.moduleList}>
              {Object.entries(groupedVideos).map(([moduleName, moduleVideos]) =>
                moduleVideos.length > 0 && (
                  <div key={moduleName} className={styles.module}>
                    <div className={styles.moduleHeader}>
                      <svg className={styles.moduleIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                      </svg>
                      <span className={styles.moduleName}>{moduleName}</span>
                      <span className={styles.moduleCount}>
                        {moduleVideos.filter((v) => completedLessons.has(v._id)).length}
                        /{moduleVideos.length}
                      </span>
                    </div>

                    <div className={styles.lessonList}>
                      {moduleVideos.map((video, index) => (
                        <div
                          key={video._id}
                          onClick={() => handleVideoSelect(video)}
                          className={`${styles.lessonItem} ${
                            selectedVideo?._id === video._id
                              ? styles.lessonItemActive
                              : ""
                          }`}
                        >
                          <div className={styles.lessonLeft}>
                            <div className={styles.lessonNumber}>{index + 1}</div>
                            <div className={styles.lessonInfo}>
                              <div className={styles.lessonTitle}>{video.title}</div>
                              <div className={styles.lessonDuration}>
                                <svg className={styles.durationIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <circle cx="12" cy="12" r="10"/>
                                  <polyline points="12 6 12 12 16 14"/>
                                </svg>
                                {formatTime(
                                  realDurations[video._id] || video.duration || 0
                                )}
                              </div>
                            </div>
                          </div>
                          <div className={styles.lessonRight}>
                            {video.status === "processing" ? (
                              <div className={styles.processingBadge} title="Transcoding…">
                                ⏳
                              </div>
                            ) : completedLessons.has(video._id) ? (
                              <div className={styles.checkmarkWrapper}>
                                <svg className={styles.checkmark} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                  <polyline points="20 6 9 17 4 12"/>
                                </svg>
                              </div>
                            ) : (
                              <div className={styles.playIconSmallWrapper}>
                                <svg className={styles.playIconSmall} viewBox="0 0 24 24" fill="currentColor">
                                  <polygon points="5 3 19 12 5 21 5 3"/>
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>

            {videos.length === 0 && (
              <div className={styles.noLessons}>
                <div className={styles.noLessonsIconWrapper}>
                  <svg className={styles.noLessonsIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </svg>
                </div>
                <p className={styles.noLessonsText}>No lessons available yet</p>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Voice Assistant */}
<VoiceAssistant videoRef={playerRef} />
    </div>
  );
}

export default CourseLearning;