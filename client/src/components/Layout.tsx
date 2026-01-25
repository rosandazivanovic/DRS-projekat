import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (!user) return <Outlet />;

  return (
    <div style={{ minHeight: "100vh", background: "#f6f2ec" }}>
      <header
        style={{
          background: "#fffaf6",
          padding: "18px 24px",
          boxShadow: "0 2px 8px rgba(39,35,30,0.04)",
          borderBottom: "1px solid rgba(44,43,40,0.03)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
            <Link
              to="/courses"
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#2c2b28",
                textDecoration: "none",
              }}
            >
              📚 Learning Platform
            </Link>

            <nav style={{ display: "flex", gap: 20 }}>
              <Link
                to="/courses"
                style={{
                  color: "#8b7762",
                  textDecoration: "none",
                  fontWeight: 500,
                }}
              >
                Kursevi
              </Link>
              

              {user.role === "STUDENT" && (
                <Link
                  to="/my-courses"
                  style={{
                    color: "#8b7762",
                    textDecoration: "none",
                    fontWeight: 500,
                  }}
                >
                  Moji kursevi
                </Link>
                
              )}

              {user.role === "PROFESOR" && (
                <>
                  <Link
                    to="/professor/courses"
                    style={{
                      color: "#8b7762",
                      textDecoration: "none",
                      fontWeight: 500,
                    }}
                  >
                    Moji kursevi
                  </Link>
                  <Link
                    to="/professor/create-course"
                    style={{
                      color: "#8b7762",
                      textDecoration: "none",
                      fontWeight: 500,
                    }}
                  >
                    Kreiraj kurs
                  </Link>
                </>
              )}

              {user.role === "ADMIN" && (
                <>
                  <Link
                    to="/admin/course-requests"
                    style={{
                      color: "#8b7762",
                      textDecoration: "none",
                      fontWeight: 500,
                    }}
                  >
                    Zahtevi za kurseve
                  </Link>
                  <Link
                    to="/admin/users"
                    style={{
                      color: "#8b7762",
                      textDecoration: "none",
                      fontWeight: 500,
                    }}
                  >
                    Korisnici
                  </Link>
                </>
              )}
            </nav>
          </div>
          
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <Link
                to="/profile"
                style={{
                  color: "#2c2b28",
                  fontSize: 14,
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 12px",
                  borderRadius: 8,
                  background: "#f5f0ea",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#e8dfd5";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#f5f0ea";
                }}
              >
                <span>👤</span>
                <span>
                  {user.firstName} {user.lastName}
                </span>
                <span style={{ fontSize: 11, color: "#8b7762" }}>
                  ({user.role})
                </span>
              </Link>

              <button onClick={handleLogout} style={{padding: "8px 16px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                color: "#9a7556",
                background: "#fff",
                boxShadow: "0 4px 12px rgba(39,35,30,0.04)",}}>
                Odjavi se
              </button>
            </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
