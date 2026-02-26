import api from './api';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

const videoService = {

  // ─────────────────────────────────────────────────────────
  //  VIDEO CRUD
  // ─────────────────────────────────────────────────────────

  getAllVideos: async (page = 1, limit = 10) => {
    const response = await api.get(`/videos?page=${page}&limit=${limit}`);
    return response.data;
  },

  getVideosByCourse: async (courseUuid) => {
    const response = await api.get(`/videos?courseUuid=${courseUuid}&limit=100`);
    return response.data;
  },

  getVideoById: async (videoId) => {
    const response = await api.get(`/videos/${videoId}`);
    return response.data;
  },

  createVideo: async (videoData) => {
    const response = await api.post('/videos', videoData);
    return response.data;
  },

  uploadVideo: async (formData, onUploadProgress) => {
    const response = await api.post('/videos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      // Optional: track upload progress for a progress bar
      onUploadProgress: onUploadProgress
        ? (e) => onUploadProgress(Math.round((e.loaded * 100) / e.total))
        : undefined,
    });
    return response.data;
  },

  updateVideo: async (videoId, updates) => {
    const response = await api.put(`/videos/${videoId}`, updates);
    return response.data;
  },

  deleteVideo: async (videoId) => {
    const response = await api.delete(`/videos/${videoId}`);
    return response.data;
  },

  // ─────────────────────────────────────────────────────────
  //  STREAMING
  //  FIX: was /stream/:id  →  now /stream/:id/master.m3u8
  //  The backend serves multi-quality HLS from this endpoint.
  // ─────────────────────────────────────────────────────────

  getStreamUrl: (videoId) => {
    // Absolute URL so HLS.js can resolve relative chunk paths correctly
    return `${BASE_URL}/api/videos/stream/${videoId}/master.m3u8`;
  },

  // ─────────────────────────────────────────────────────────
  //  PROGRESS
  //  FIX: was POST /progress/:id  →  now POST /videos/:id/progress
  //  FIX: payload was { lastPosition, videoDuration }
  //       now must be  { currentTime, duration }
  // ─────────────────────────────────────────────────────────

  /**
   * Save current playback position (called every 5s by the player).
   * @param {string} videoId
   * @param {number} currentTime  — playback position in seconds
   * @param {number} duration     — total video duration in seconds
   */
  updateProgress: async (videoId, { currentTime, duration }) => {
    const response = await api.post(`/videos/${videoId}/progress`, {
      currentTime,
      duration,
    });
    return response.data;
  },

  getProgress: async (videoId) => {
    const response = await api.get(`/progress/${videoId}`);
    return response.data;
  },

  getAllProgress: async () => {
    const response = await api.get('/progress');
    return response.data;
  },

  // ─────────────────────────────────────────────────────────
  //  COMPLETION
  //  FIX: backend now validates server-side maxReached,
  //       but still accepts the POST — no payload needed.
  // ─────────────────────────────────────────────────────────

  markVideoComplete: async (videoId) => {
    const response = await api.post(`/videos/${videoId}/complete`);
    return response.data;
  },

  // ─────────────────────────────────────────────────────────
  //  DOWNLOAD
  //  FIX: returns a URL with the auth token in the header.
  //       Use this instead of window.open() — see CourseLearning.
  // ─────────────────────────────────────────────────────────

  downloadVideo: async (videoId) => {
    const response = await api.get(`/videos/download/${videoId}`, {
      responseType: 'blob',
    });
    return response;
  },

  // ─────────────────────────────────────────────────────────
  //  ADMIN TOGGLES
  // ─────────────────────────────────────────────────────────

  toggleDownload: async (videoId, allowDownload) => {
    const response = await api.patch(`/videos/${videoId}/download`, {
      allowDownload,
    });
    return response.data;
  },

  toggleWatchRestriction: async (
    videoId,
    requireWatchPercentage,
    minimumWatchPercent = 80
  ) => {
    const response = await api.patch(`/videos/${videoId}/watch-restriction`, {
      requireWatchPercentage,
      minimumWatchPercent,
    });
    return response.data;
  },
};

export default videoService;