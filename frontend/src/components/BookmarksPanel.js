import React, { useState, useEffect,useCallback } from 'react';
import bookmarkService from '../services/bookmarkService';
import { formatTime } from '../utils/timeFormat';

function BookmarksPanel({ videoId, currentTime, onSeek }) {
  const [bookmarks, setBookmarks] = useState([]);
  const [label, setLabel] = useState('');
  const [loading, setLoading] = useState(false);

 const loadBookmarks = useCallback(async () => {
    try {
      const data = await bookmarkService.getBookmarks(videoId);
      setBookmarks(data.bookmarks);
    } catch (err) {
      console.error('Failed to load bookmarks:', err);
    }
  }, [videoId]); // Only recreate if videoId changes

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  const handleAddBookmark = async () => {
    setLoading(true);
    try {
      await bookmarkService.createBookmark(videoId, {
        timestampSeconds: Math.floor(currentTime),
        label: label.trim() || `Bookmark at ${formatTime(currentTime)}`
      });
      setLabel('');
      loadBookmarks();
    } catch (err) {
      alert('Failed to add bookmark');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBookmark = async (bookmarkId) => {
    if (!window.confirm('Delete this bookmark?')) return;

    try {
      await bookmarkService.deleteBookmark(bookmarkId);
      loadBookmarks();
    } catch (err) {
      alert('Failed to delete bookmark');
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>🔖 Bookmarks</h3>

      {/* Add Bookmark Section */}
      <div style={styles.addSection}>
        <div style={styles.timestamp}>
          At: {formatTime(currentTime)}
        </div>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Bookmark label (optional)"
          style={styles.input}
        />
        <button 
          onClick={handleAddBookmark} 
          disabled={loading}
          style={styles.addButton}
        >
          {loading ? 'Adding...' : '+ Add Bookmark'}
        </button>
      </div>

      {/* Bookmarks List */}
      <div style={styles.bookmarksList}>
        {bookmarks.length === 0 ? (
          <p style={styles.emptyText}>No bookmarks yet. Mark important moments!</p>
        ) : (
          bookmarks.map((bookmark) => (
            <div key={bookmark._id} style={styles.bookmarkItem}>
              <div 
                style={styles.bookmarkContent}
                onClick={() => onSeek(bookmark.timestampSeconds)}
              >
                <span style={styles.bookmarkTime}>
                  🕐 {formatTime(bookmark.timestampSeconds)}
                </span>
                <span style={styles.bookmarkLabel}>
                  {bookmark.label}
                </span>
              </div>
              <button 
                onClick={() => handleDeleteBookmark(bookmark._id)}
                style={styles.deleteButton}
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '0',
    backgroundColor: 'transparent',
  },
  title: {
    margin: '20px 20px 15px',
    color: '#2c3e50',
    fontSize: '18px',
    fontWeight: '700',
  },
  addSection: {
    margin: '0 20px 20px',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    border: '1px solid #e0e0e0',
  },
  timestamp: {
    fontSize: '13px',
    color: '#00a896',
    marginBottom: '12px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
    marginBottom: '12px',
    transition: 'border-color 0.3s',
  },
  addButton: {
    width: '100%',
    padding: '10px 20px',
    backgroundColor: '#00a896',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'background-color 0.3s',
  },
  bookmarksList: {
    maxHeight: '500px',
    overflowY: 'auto',
    padding: '0 20px 20px',
  },
  emptyText: {
    textAlign: 'center',
    color: '#7f8c8d',
    padding: '40px 20px',
    fontSize: '14px',
  },
  bookmarkItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px',
    borderRadius: '8px',
    marginBottom: '10px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #e0e0e0',
    transition: 'all 0.3s',
  },
  bookmarkContent: {
    flex: 1,
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  bookmarkTime: {
    fontSize: '12px',
    color: '#00a896',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '4px 8px',
    backgroundColor: '#e8f5f3',
    borderRadius: '6px',
    width: 'fit-content',
  },
  bookmarkLabel: {
    color: '#2c3e50',
    fontSize: '14px',
    fontWeight: '500',
  },
  deleteButton: {
    padding: '8px 12px',
    backgroundColor: '#ff6b6b',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'background-color 0.3s',
  },
};

export default BookmarksPanel;