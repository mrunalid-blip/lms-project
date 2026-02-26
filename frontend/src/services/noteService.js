import api from './api';

const noteService = {
  // Create note
  createNote: async (videoId, noteData) => {
    const response = await api.post(`/notes/${videoId}`, noteData);
    return response.data;
  },

  // Get notes for video
  getNotes: async (videoId) => {
    const response = await api.get(`/notes/${videoId}`);
    return response.data;
  },

  // Update note
  updateNote: async (noteId, noteText) => {
    const response = await api.put(`/notes/${noteId}`, { noteText });
    return response.data;
  },

  // Delete note
  deleteNote: async (noteId) => {
    const response = await api.delete(`/notes/${noteId}`);
    return response.data;
  },
};

export default noteService;