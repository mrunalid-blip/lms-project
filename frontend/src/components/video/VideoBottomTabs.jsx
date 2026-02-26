import { useState } from "react";
import styles from "./VideoBottomTabs.module.css";

function VideoBottomTabs({
  overview,
  notes,
  onNotesChange,
  onCreateNote, // ✅ ADD
  videoNotes,
  comments,
  onCreateComment,

  bookmarks,
  onBookmarkClick,
  onCreateBookmark,
  activeTab, // ✅ ADD
  onTabChange,
  
}) {
  const [newComment, setNewComment] = useState("");

 const handlePostComment = async () => {
  if (!newComment.trim()) return;

  await onCreateComment(newComment);
  setNewComment("");
};

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        <button
          className={activeTab === "comments" ? styles.tabActive : styles.tab}
          onClick={() => onTabChange("comments")}
        >
          💬 Comments
        </button>
        <button
          className={activeTab === "notes" ? styles.tabActive : styles.tab}
          onClick={() => onTabChange("notes")}
        >
          📝 Notes
        </button>
        <button
          className={activeTab === "bookmarks" ? styles.tabActive : styles.tab}
          onClick={() => onTabChange("bookmarks")}
        >
          🔖 Bookmarks
        </button>
        <button
          className={activeTab === "qa" ? styles.tabActive : styles.tab}
          onClick={() => onTabChange("qa")}
        >
          ❓ Ask Question
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === "comments" && (
          <div className={styles.commentsTab}>
            <div className={styles.addCommentSection}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className={styles.commentInput}
                rows="3"
              />
              <div className={styles.commentActions}>
                <button
                  onClick={() => setNewComment("")}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button
                  onClick={handlePostComment}
                  disabled={!newComment.trim()}
                  className={styles.postBtn}
                >
                  Comment
                </button>
              </div>
            </div>
            <div className={styles.commentsList}>
  {comments?.length === 0 ? (
    <p className={styles.emptyState}>No comments yet</p>
  ) : (
    comments.map((c) => (
     <div key={c._id} className={styles.commentItem}>
  <p className={styles.commentAuthor}>
    👤 {c.userId?.fullName || "Anonymous"}
  </p>
  <p className={styles.commentText}>{c.text}</p>

   

      </div>
    ))
  )}
</div>

          </div>
        )}

        {activeTab === "notes" && (
          <div className={styles.notesTab}>
            <textarea
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Write your notes here..."
              className={styles.notesTextarea}
              rows="6"
            />

            {/* SAVE NOTE BUTTON */}
            <button
              onClick={onCreateNote}
              disabled={!notes.trim()}
              className={styles.postBtn}
            >
              💾 Save Note
            </button>

            {/* SAVED NOTES LIST */}
            <div className={styles.notesList}>
              {videoNotes?.length === 0 ? (
                <p className={styles.emptyState}>No notes yet</p>
              ) : (
                videoNotes.map((n) => (
                  <div key={n._id} className={styles.noteItem}>
                    <span className={styles.noteTime}>
                      ⏱️ {Math.floor(n.timestampSeconds / 60)}:
                      {(n.timestampSeconds % 60).toString().padStart(2, "0")}
                    </span>
                    <p className={styles.noteText}>{n.noteText}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "bookmarks" && (
          <div className={styles.bookmarksTab}>
            {bookmarks.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No bookmarks yet</p>
                <button
                  onClick={onCreateBookmark}
                  className={styles.addBookmarkBtn}
                >
                  + Add Bookmark
                </button>
              </div>
            ) : (
              <ul className={styles.bookmarksList}>
                {bookmarks.map((b) => (
                  <li
                    key={b._id}
                    onClick={() => onBookmarkClick(b.timestampSeconds)}
                    className={styles.bookmarkItem}
                  >
                    <span className={styles.bookmarkIcon}>⏱️</span>
                    <span className={styles.bookmarkLabel}>{b.label}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeTab === "qa" && (
          <div className={styles.qaTab}>
            <div className={styles.askQuestionSection}>
              <textarea
                placeholder="Ask a question about this video..."
                className={styles.questionInput}
                rows="3"
              />
              <button className={styles.askBtn}>Ask Question</button>
            </div>
            <div className={styles.questionsPlaceholder}>
              <p>No questions yet. Ask the first question!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoBottomTabs;
