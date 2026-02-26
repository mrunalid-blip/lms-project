import api from "./api";

const courseService = {
  // ================= USER APIs =================

  // Get all published courses
  getAllCourses: async () => {
    const response = await api.get("/courses");
    return response.data;
  },

  // Get single course
  getCourseById: async (uuid) => {
    const response = await api.get(`/courses/${uuid}`);
    return response.data;
  },

  // Enroll user in course
  enrollInCourse: async (courseUuid) => {
    const response = await api.post("/enrollments", {
      courseId: courseUuid,
    });
    return response.data;
  },

  // Get logged-in user's enrollments
  getMyEnrollments: async () => {
    const response = await api.get("/enrollments/my");
    return response.data.enrollments;
  },

  // Check enrollment
  checkEnrollment: async (courseUuid) => {
    const res = await api.get("/enrollments/my");
    return res.data.enrollments.some(
      (e) => e.courseId?.uuid === courseUuid
    );
  },

  // ================= ADMIN APIs =================

  // Create course
  createCourse: async (data) => {
    const response = await api.post("/admin/courses", data);
    return response.data;
  },

  // Update course
  updateCourse: async (uuid, data) => {
    const response = await api.put(`/admin/courses/${uuid}`, data);
    return response.data;
  },

  // Delete course
  deleteCourse: async (uuid) => {
    const response = await api.delete(`/admin/courses/${uuid}`);
    return response.data;
  },

  // Admin: get all (including drafts)
  getAllCoursesAdmin: async () => {
    const response = await api.get("/admin/courses");
    return response.data;
  },
};

export default courseService;
