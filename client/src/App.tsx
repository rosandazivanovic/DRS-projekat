import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./auth/ProtectedRoute";
import Layout from "./components/Layout";

import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import CoursesPage from "./pages/Courses";
import CourseDetailsPage from "./pages/CourseDetails";
import MyCoursesPage from "./pages/MyCourses";
import ProfessorCreateCoursePage from "./pages/ProfessorCreateCourse";
import ProfessorMyCoursesPage from "./pages/ProfessorMyCourses";
import ProfessorCourseManagementPage from "./pages/ProfessorCourseManagement";
import AdminPendingCourses from "./pages/AdminPendingCourses";
import AdminUsersPage from "./pages/AdminUsers";
import UserProfilePage from "./pages/UserProfile";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:id" element={<CourseDetailsPage />} />
        <Route path="/profile" element={<UserProfilePage />} />

        <Route
          path="/my-courses"
          element={
            <ProtectedRoute roles={["STUDENT"]}>
              <MyCoursesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/professor/create-course"
          element={
            <ProtectedRoute roles={["PROFESOR"]}>
              <ProfessorCreateCoursePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/professor/courses"
          element={
            <ProtectedRoute roles={["PROFESOR"]}>
              <ProfessorMyCoursesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/professor/courses/:id/manage"
          element={
            <ProtectedRoute roles={["PROFESOR"]}>
              <ProfessorCourseManagementPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/course-requests"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <AdminPendingCourses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="/" element={<Navigate to="/courses" replace />} />
      <Route path="*" element={<Navigate to="/courses" replace />} />
    </Routes>
  );
}

export default App;