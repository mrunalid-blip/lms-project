import React, { useState, useEffect,useCallback } from 'react';
import noteService from '../services/noteService';
import { formatTime } from '../utils/timeFormat';

function NotesPanel({ videoId, currentTime, onSeek }) {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

const loadNotes = useCallback(async () => {
    try {
      const data = await noteService.getNotes(videoId);
      setNotes(data.notes);
    } catch (err) {
      console.error('Failed to load notes:', err);
    }
  }, [videoId]); // Only recreate if videoId changes

  useEffect(() => {
    loadNotes();
  }, [loadNotes]); 

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    setLoading(true);
    try {
      await noteService.createNote(videoId, {
        timestampSeconds: Math.floor(currentTime),
        noteText: newNote
      });
      setNewNote('');
      loadNotes();
    } catch (err) {
      alert('Failed to add note');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNote = async (noteId) => {
    if (!editingNote) return;

    try {
      await noteService.updateNote(noteId, editingNote);
      setEditingNote(null);
      loadNotes();
    } catch (err) {
      alert('Failed to update note');
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Delete this note?')) return;

    try {
      await noteService.deleteNote(noteId);
      loadNotes();
    } catch (err) {
      alert('Failed to delete note');
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>📝 My Notes</h3>

      {/* Add Note Section */}
      <div style={styles.addSection}>
        <div style={styles.timestamp}>
          At: {formatTime(currentTime)}
        </div>
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a note at current time..."
          style={styles.textarea}
          rows="3"
        />
        <button 
          onClick={handleAddNote} 
          disabled={loading || !newNote.trim()}
          style={styles.addButton}
        >
          {loading ? 'Adding...' : 'Add Note'}
        </button>
      </div>

      {/* Notes List */}
      <div style={styles.notesList}>
        {notes.length === 0 ? (
          <p style={styles.emptyText}>No notes yet. Add your first note!</p>
        ) : (
          notes.map((note) => (
            <div key={note._id} style={styles.noteItem}>
              <div 
                style={styles.noteTimestamp}
                onClick={() => onSeek(note.timestampSeconds)}
              >
                🕐 {formatTime(note.timestampSeconds)}
              </div>
              
              {editingNote && editingNote.id === note._id ? (
                <div>
                  <textarea
                    value={editingNote.text}
                    onChange={(e) => setEditingNote({ id: note._id, text: e.target.value })}
                    style={styles.textarea}
                    rows="2"
                  />
                  <div style={styles.noteActions}>
                    <button 
                      onClick={() => handleUpdateNote(note._id)}
                      style={styles.saveButton}
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => setEditingNote(null)}
                      style={styles.cancelButton}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p style={styles.noteText}>{note.noteText}</p>
                  <div style={styles.noteActions}>
                    <button 
                      onClick={() => setEditingNote({ id: note._id, text: note.noteText })}
                      style={styles.editButton}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteNote(note._id)}
                      style={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
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
    color: '#0066cc',
    marginBottom: '12px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  textarea: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical',
    boxSizing: 'border-box',
    transition: 'border-color 0.3s',
    minHeight: '80px',
  },
  addButton: {
    marginTop: '12px',
    padding: '10px 20px',
    backgroundColor: '#0066cc',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    width: '100%',
    transition: 'background-color 0.3s',
  },
  notesList: {
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
  noteItem: {
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '12px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #e0e0e0',
    transition: 'all 0.3s',
  },
  noteTimestamp: {
    fontSize: '12px',
    color: '#0066cc',
    marginBottom: '10px',
    cursor: 'pointer',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '4px 8px',
    backgroundColor: '#e3f2fd',
    borderRadius: '6px',
  },
  noteText: {
    margin: '12px 0',
    color: '#2c3e50',
    lineHeight: '1.6',
    fontSize: '14px',
  },
  noteActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '12px',
  },
  editButton: {
    padding: '6px 14px',
    backgroundColor: '#ffc107',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
  },
  deleteButton: {
    padding: '6px 14px',
    backgroundColor: '#ff6b6b',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
  },
  saveButton: {
    padding: '6px 14px',
    backgroundColor: '#00a896',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
  },
  cancelButton: {
    padding: '6px 14px',
    backgroundColor: '#7f8c8d',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
  },
};

export default NotesPanel;