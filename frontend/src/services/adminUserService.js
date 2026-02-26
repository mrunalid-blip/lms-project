import api from "./api"; // your existing axios instance

const adminUserService = {
  // Get all users
  getAllUsers: () =>
    api.get("/admin/users"),

  // Get courses of a user
  getUserCourses: (userId) =>
    api.get(`/admin/users/${userId}/courses`),

  // Assign course to user
  assignCourse: (userId, courseUuid) =>
    api.post(`/admin/users/${userId}/enroll`, {
      courseUuid,
    }),

  // Remove course
  removeCourse: (userId, courseUuid) =>
    api.delete(`/admin/users/${userId}/courses/${courseUuid}`),
  // Change role (admin <-> learner)
updateUserRole: (userId, role) =>
  api.patch(`/admin/users/${userId}/role`, { role }),


  // Enable / disable user
  toggleUserStatus: (userId) =>
    api.patch(`/admin/users/${userId}/status`)
};


export default adminUserService;
