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
    <div style={pageWrap}>
      <header style={header}>
        <div style={headerContent}>
          <div style={leftSection}>
            <Link to="/courses" style={logo}>
              📚 Learning Platform
            </Link>

            <nav style={nav}>
              <Link to="/courses" style={navLink}>
                Kursevi
              </Link>

              {user.role === "STUDENT" && (
                <>
                  <Link to="/my-courses" style={navLink}>
                    Moji kursevi
                  </Link>
                  <Link to="/my-submissions" style={navLink}>
                    Moja rešenja
                  </Link>
                </>
              )}

              {user.role === "PROFESOR" && (
                <>
                  <Link to="/professor/courses" style={navLink}>
                    Moji kursevi
                  </Link>
                  <Link to="/professor/create-course" style={navLink}>
                    Kreiraj kurs
                  </Link>
                </>
              )}

              {user.role === "ADMIN" && (
                <>
                  <Link to="/admin/course-requests" style={navLink}>
                    Zahtevi za kurseve
                  </Link>
                  <Link to="/admin/users" style={navLink}>
                    Korisnici
                  </Link>
                </>
              )}
            </nav>
          </div>

          <div style={rightSection}>
            <Link
              to="/profile"
              style={profileLink}
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
              <span style={roleBadge}>
                ({user.role})
              </span>
            </Link>

            <button onClick={handleLogout} style={logoutButton}>
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

/* ----------------- Styles ----------------- */
const pageWrap: React.CSSProperties = {
  minHeight: "100vh",
  background: "#f6f2ec",
};

const header: React.CSSProperties = {
  background: "#fffaf6",
  padding: "18px 24px",
  boxShadow: "0 2px 8px rgba(39,35,30,0.04)",
  borderBottom: "1px solid rgba(44,43,40,0.03)",
};

const headerContent: React.CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 24,
};

const leftSection: React.CSSProperties = {
  display: "flex",
  gap: 32,
  alignItems: "center",
};

const logo: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  color: "#2c2b28",
  textDecoration: "none",
};

const nav: React.CSSProperties = {
  display: "flex",
  gap: 20,
};

const navLink: React.CSSProperties = {
  color: "#8b7762",
  textDecoration: "none",
  fontWeight: 600,
  fontSize: 14,
  transition: "color 0.2s",
};

const rightSection: React.CSSProperties = {
  display: "flex",
  gap: 16,
  alignItems: "center",
};

const profileLink: React.CSSProperties = {
  color: "#2c2b28",
  fontSize: 14,
  textDecoration: "none",
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 14px",
  borderRadius: 10,
  background: "#f5f0ea",
  transition: "all 0.2s",
  fontWeight: 600,
};

const roleBadge: React.CSSProperties = {
  fontSize: 11,
  color: "#8b7762",
  fontWeight: 600,
};

const logoutButton: React.CSSProperties = {
  padding: "8px 16px",
  borderRadius: 10,
  border: "1px solid rgba(44,43,40,0.12)",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 14,
  color: "#8b7762",
  background: "#fff",
  boxShadow: "0 2px 8px rgba(39,35,30,0.04)",
  transition: "all 0.2s",
};