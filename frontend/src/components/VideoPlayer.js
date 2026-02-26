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
 const bypassSeekRestrictionRef = useRef(false);
  const isSeekingRef = useRef(false);

  // ───────────────────────────────────────────────────────────
  // Expose methods to parent
  // ───────────────────────────────────────────────────────────

 useImperativeHandle(
  ref,
  () => ({
    play() {
      videoRef.current?.play();
    },

    pause() {
      videoRef.current?.pause();
    },

    seekTo(seconds) {
  const video = videoRef.current;
  if (!video) return;

  bypassSeekRestrictionRef.current = true; // allow this seek

  video.currentTime = seconds;

  setTimeout(() => {
    bypassSeekRestrictionRef.current = false;
  }, 300);
},
scrollIntoView() {
  const video = videoRef.current;
  if (!video) return;

  video.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
},

    forward(seconds = 10) {
      videoRef.current.currentTime += seconds;
    },

    backward(seconds = 10) {
      videoRef.current.currentTime -= seconds;
    },

    setPlaybackRate(rate) {
      videoRef.current.playbackRate = rate;
    },

    mute() {
      videoRef.current.muted = true;
    },

    unmute() {
      videoRef.current.muted = false;
    },

    getDuration() {
      return videoRef.current?.duration || 0;
    },

    getCurrentTime() {
      return Math.floor(videoRef.current?.currentTime || 0);
    },
    

    changeQuality(levelIndex) {
      if (hlsRef.current) {
        hlsRef.current.currentLevel = levelIndex;
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

  const current = video.currentTime;

  // If we just corrected a seek, ignore this update
  if (isSeekingRef.current) {
    isSeekingRef.current = false;
    return;
  }

  // Only update max when playing forward normally
  if (!video.seeking && current > maxWatchedTimeRef.current) {
    maxWatchedTimeRef.current = current;
  }

  const floored = Math.floor(current);

  if (floored - lastSavedTimeRef.current >= SAVE_INTERVAL) {
    lastSavedTimeRef.current = floored;
    onProgress?.(floored);
    onTimeUpdate?.(floored);
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

  if (bypassSeekRestrictionRef.current) return; // allow bookmark seeks

  const attempted = video.currentTime;
  const allowed = maxWatchedTimeRef.current;

  if (attempted > allowed + 0.5) {
    isSeekingRef.current = true;
    video.currentTime = allowed;
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