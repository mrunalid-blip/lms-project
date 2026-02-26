import styles from "./VideoControls.module.css";

function VideoControls({
  onBookmark,
  onToggleSubtitles,
  subtitlesEnabled,
  bookmarked,
  onAddNote,

  allowDownload = false,   // 👈 NEW
  onDownload,              // 👈 NEW
}) {
  return (
    <div className={styles.controls}>
      {/* 🔖 BOOKMARK */}
      <button onClick={onBookmark} title="Bookmark">
        {bookmarked ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        ) : (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {/* ⬇️ DOWNLOAD (ONLY IF ENABLED) */}
      {allowDownload && (
        <button onClick={onDownload} title="Download video">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 3v12" />
            <path d="M7 10l5 5 5-5" />
            <path d="M5 21h14" />
          </svg>
        </button>
      )}

      {/* ➕ ADD NOTE */}
      <button onClick={onAddNote} title="Add note">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      {/* CC */}
      <button onClick={onToggleSubtitles} title="Subtitles">
        {subtitlesEnabled ? "CC ON" : "CC"}
      </button>
    </div>
  );
}

export default VideoControls;
