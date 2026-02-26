import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";


/* ===================== USER PAGES ===================== */
import Login from "./pages/Login";
import Register from "./pages/Register";
import CourseList from "./pages/CourseList";
import CourseDetails from "./pages/CourseDetails";
import CourseLearning from "./pages/CourseLearning";
import VideoList from "./pages/VideoList";
import VideoWatch from "./pages/VideoWatch";

/* ===================== ADMIN PAGES ===================== */
import AdminDashboard from "./pages/admin/AdminDashboard";
import VideoManagement from "./pages/admin/VideoManagement";
import CourseForm from "./pages/admin/CourseForm";
import AdminVideoList from "./pages/admin/VideoList";
import VideoUpload from "./pages/admin/VideoUpload";
import EditVideo from "./pages/admin/EditVideo";
import AdminUsers from "./pages/admin/AdminUsers";

/* ===================== PROTECTED ROUTES ===================== */
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/courses" />;

  return children;
}

/* ===================== APP ===================== */
function App() {
  return (
    
    <AuthProvider>
      <Router>
        <Routes>
          {/* ---------- AUTH ---------- */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ---------- USER ---------- */}
          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <CourseList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/course/:uuid"
            element={
              <ProtectedRoute>
                <CourseDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/course/:uuid/learn"
            element={
              <ProtectedRoute>
                <CourseLearning />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <VideoList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/video/:id"
            element={
              <ProtectedRoute>
                <VideoWatch />
              </ProtectedRoute>
            }
          />

          {/* Backward compatibility */}
          <Route path="/videos" element={<Navigate to="/dashboard" />} />

          {/* ---------- ADMIN ---------- */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/videos"
            element={
              <AdminRoute>
                <VideoManagement />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/videos/:id/edit"
            element={
              <AdminRoute>
                <EditVideo />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/course/:courseId/edit"
            element={
              <AdminRoute>
                <CourseForm />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/course/new"
            element={
              <AdminRoute>
                <CourseForm />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/course/:courseId/videos"
            element={
              <AdminRoute>
                <AdminVideoList />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/course/:courseId/upload"
            element={
              <AdminRoute>
                <VideoUpload />
              </AdminRoute>
            }
          />

          {/* ---------- DEFAULT ---------- */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <CourseList />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
