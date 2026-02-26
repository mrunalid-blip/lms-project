import {
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import Hls from "hls.js";

/**
 * SecureVideoPlayer (Optimized)
 *
 * Fixes:
 * - Prevents excessive progress API calls
 * - Saves every 10 seconds
 * - Saves on pause
 * - Saves on page unload
 */

const SAVE_INTERVAL = 10; // seconds

const VideoPlayer = forwardRef(function VideoPlayer(
  {
    videoUrl,
    allowDownload = false,
    restrictForwardSeek = false,
    onProgress,
    onTimeUpdate,
    initialTime = 0,
  },
  ref
) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  const maxWatchedTimeRef = useRef(0);
  const lastSavedTimeRef = useRef(0);

  // ───────────────────────────────────────────────────────────
  // Expose methods to parent
  // ───────────────────────────────────────────────────────────

  useImperativeHandle(
    ref,
    () => ({
      seekTo(seconds) {
        const video = videoRef.current;
        if (!video) return;

        if (restrictForwardSeek && seconds > maxWatchedTimeRef.current) return;

        video.currentTime = seconds;
      },

      getCurrentTime() {
        return videoRef.current
          ? Math.floor(videoRef.current.currentTime)
          : 0;
      },

      changeQuality(levelIndex) {
        if (hlsRef.current) {
          hlsRef.current.currentLevel = levelIndex; // -1 = Auto
        }
      },
    }),
    [restrictForwardSeek]
  );

  // ───────────────────────────────────────────────────────────
  // HLS Setup
  // ───────────────────────────────────────────────────────────

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    maxWatchedTimeRef.current = initialTime || 0;
    lastSavedTimeRef.current = initialTime || 0;

    if (Hls.isSupported()) {
      const hls = new Hls({
        xhrSetup(xhr) {
          const token = localStorage.getItem("token");
          if (token) {
            xhr.setRequestHeader("Authorization", `Bearer ${token}`);
          }
        },
        startLevel: 0,
        autoStartLoad: true,
        capLevelToPlayerSize: true,
      });

      hls.loadSource(videoUrl);
      hls.attachMedia(video);
      hlsRef.current = hls;

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          console.error("HLS fatal error:", data.type, data.details);
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else {
            hls.destroy();
          }
        }
      });

      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    }

    // Safari native HLS
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoUrl;
    }
  }, [videoUrl, initialTime]);

  // ───────────────────────────────────────────────────────────
  // Resume position + dispatch real duration
  // ───────────────────────────────────────────────────────────

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (initialTime > 0) {
      video.currentTime = initialTime;
      maxWatchedTimeRef.current = initialTime;
      lastSavedTimeRef.current = initialTime;
    }

    window.dispatchEvent(
      new CustomEvent("video-duration", { detail: video.duration })
    );
  }, [initialTime]);

  // ───────────────────────────────────────────────────────────
  // Optimized Progress Saving (NO FLOODING)
  // ───────────────────────────────────────────────────────────

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const currentTime = Math.floor(video.currentTime);

    // Track max reached
    if (currentTime > maxWatchedTimeRef.current) {
      maxWatchedTimeRef.current = currentTime;
    }

    // Save only every SAVE_INTERVAL seconds
    if (currentTime - lastSavedTimeRef.current >= SAVE_INTERVAL) {
      lastSavedTimeRef.current = currentTime;
      onProgress?.(currentTime);
      onTimeUpdate?.(currentTime);
    }
  }, [onProgress, onTimeUpdate]);

  // ───────────────────────────────────────────────────────────
  // Save on Pause (Important)
  // ───────────────────────────────────────────────────────────

  const handlePause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const currentTime = Math.floor(video.currentTime);

    lastSavedTimeRef.current = currentTime;
    onProgress?.(currentTime);
  }, [onProgress]);

  // ───────────────────────────────────────────────────────────
  // Prevent Forward Seek (Force Watch)
  // ───────────────────────────────────────────────────────────

  const handleSeeking = useCallback(() => {
    if (!restrictForwardSeek) return;

    const video = videoRef.current;
    if (!video) return;

    if (video.currentTime > maxWatchedTimeRef.current) {
      video.currentTime = maxWatchedTimeRef.current;
    }
  }, [restrictForwardSeek]);

  // ───────────────────────────────────────────────────────────
  // Save progress before leaving page
  // ───────────────────────────────────────────────────────────

  useEffect(() => {
    const handleBeforeUnload = () => {
      const video = videoRef.current;
      if (!video) return;

      onProgress?.(Math.floor(video.currentTime));
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [onProgress]);

  // ───────────────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────────────

  return (
    <video
      ref={videoRef}
      controls
      preload="metadata"
      playsInline
      onLoadedMetadata={handleLoadedMetadata}
      onTimeUpdate={handleTimeUpdate}
      onPause={handlePause}
      onSeeking={handleSeeking}
      controlsList={allowDownload ? undefined : "nodownload"}
      onContextMenu={(e) => {
        if (!allowDownload) e.preventDefault();
      }}
      style={{ width: "100%", background: "#000" }}
    />
  );
});

export default VideoPlayer;