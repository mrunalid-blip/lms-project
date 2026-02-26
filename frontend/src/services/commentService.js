import api from "./api";

const commentService = {
  createComment: async (videoId, text) => {
    const res = await api.post(`/comments/${videoId}`, { text });
    return res.data;
  },

  getComments: async (videoId) => {
    const res = await api.get(`/comments/${videoId}`);
    return res.data;
  },

  deleteComment: async (commentId) => {
    const res = await api.delete(`/comments/${commentId}`);
    return res.data;
  },
};

export default commentService;
