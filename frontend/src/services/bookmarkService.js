import api from './api';

const bookmarkService = {
  // Create bookmark
  createBookmark: async (videoId, bookmarkData) => {
    const response = await api.post(`/bookmarks/${videoId}`, bookmarkData);
    return response.data;
  },

  // Get bookmarks for video
  getBookmarks: async (videoId) => {
    const response = await api.get(`/bookmarks/${videoId}`);
    return response.data;
  },

  // Delete bookmark
  deleteBookmark: async (bookmarkId) => {
    const response = await api.delete(`/bookmarks/${bookmarkId}`);
    return response.data;
  },
};

export default bookmarkService;