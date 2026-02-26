import api from "./api";

const reactionService = {
  getCounts(videoId) {
    return api.get(`/videos/${videoId}/reaction`)
      .then(res => res.data);
  },

  getMyReaction(videoId) {
    return api.get(`/videos/${videoId}/reaction/me`)
      .then(res => res.data);
  },

  react(videoId, reaction) {
    return api.post(`/videos/${videoId}/reaction`, { reaction })
      .then(res => res.data);
  },
};

export default reactionService;
