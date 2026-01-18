import { Link, Route, Routes } from "react-router-dom";
import CoursesPage from "./pages/Courses";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import ProtectedRoute from "./auth/ProtectedRoute";
import { useAuth } from "./auth/AuthContext";
import MyEnrollmentsPage from "./pages/MyEnrollments";
import AdminReviewsPage from "./pages/AdminReviews";
import AdminPendingCourses from "./pages/AdminPendingCourses";
import ProfessorCreateCoursePage from "./pages/ProfessorCreateCourse";
import ProfessorMyCoursesPage from "./pages/ProfessorMyCourses";
import AdminReportsPage from "./pages/AdminReports";

function TopBar() {
  const { user, logout } = useAuth();

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "#fff",
        borderBottom: "1px solid #eee",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "12px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Left */}
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <Link
            to="/courses"
            style={{
              fontWeight: 700,
              fontSize: 18,
              textDecoration: "none",
              color: "#667eea",
            }}
          >
            🎓 EduPlatform
          </Link>

          <div style={{ display: "flex", gap: 12 }}>
            <Link style={navLink} to="/courses">Kursevi</Link>
            <Link style={navLink} to="/enrollments">Moji upisi</Link>

            {user?.role === "ADMIN" && (
              <>
                <Link style={navLink} to="/admin/reviews">Ocene</Link>
                <Link style={navLink} to="/admin/pending">Na čekanju</Link>
                <Link style={navLink} to="/admin/reports">Izveštaji</Link>
              </>
            )}

            {user?.role === "PROFESOR" && (
              <>
                <Link style={navLink} to="/professor/courses/new">Novi kurs</Link>
                <Link style={navLink} to="/professor/courses">Moji kursevi</Link>
              </>
            )}
          </div>
        </div>

        {/* Right */}
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          {user ? (
            <>
              <div
                style={{
                  fontSize: 13,
                  color: "#555",
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: "#f3f3f3",
                }}
              >
                {user.firstName} • {user.role}
              </div>

              <button
                onClick={() => logout()}
                style={{
                  padding: "6px 12px",
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  color: "#fff",
                  background: "linear-gradient(135deg, #667eea, #764ba2)",
                }}
              >
                Odjava
              </button>
            </>
          ) : (
            <>
              <Link style={navLink} to="/login">Prijava</Link>
              <Link
                to="/register"
                style={{
                  ...navLink,
                  padding: "6px 12px",
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #667eea, #764ba2)",
                  color: "#fff",
                }}
              >
                Registracija
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const navLink: React.CSSProperties = {
  textDecoration: "none",
  color: "#444",
  fontSize: 14,
  fontWeight: 500,
};

export default function App() {
  return (
    <div>
      <TopBar />

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/courses"
          element={
            <ProtectedRoute>
              <CoursesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/enrollments"
          element={
            <ProtectedRoute>
              <MyEnrollmentsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/reviews"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <AdminReviewsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/pending"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <AdminPendingCourses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <AdminReportsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/professor/courses/new"
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

        <Route path="*" element={<LoginPage />} />
      </Routes>
    </div>
  );
}
