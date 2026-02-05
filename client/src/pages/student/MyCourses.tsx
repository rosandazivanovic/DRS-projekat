import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { http } from "../../api/https";
import { endpoints } from "../../api/endpoints";
import type { Course } from "../../types/courses";
import { useAuth } from "../../auth/AuthContext";

const BookOpenIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);

const AlertCircleIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const LoaderIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="2" x2="12" y2="6"/>
    <line x1="12" y1="18" x2="12" y2="22"/>
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
    <line x1="2" y1="12" x2="6" y2="12"/>
    <line x1="18" y1="12" x2="22" y2="12"/>
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/>
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
  </svg>
);

const BookIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);

const UserIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const BookmarkIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
  </svg>
);

export default function MyCoursesPage() {
  const { user, hasRole } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !hasRole(["STUDENT"])) return;
    fetchMyCourses();
  }, [user]);

  const fetchMyCourses = async () => {
    setLoading(true);
    try {
      const res = await http.get(endpoints.courses.myCourses);
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user || !hasRole(["STUDENT"])) {
    return (
      <div style={pageWrap}>
        <div style={errorContainer}>
          <div style={{ marginBottom: 16, color: "#9a7556", display: "flex", justifyContent: "center" }}>
            <AlertCircleIcon />
          </div>
          Nemaš pristup ovoj stranici.
        </div>
      </div>
    );
  }

  return (
    <div style={pageWrap}>
      <div style={container}>
        <div style={header}>
          <h2 style={{ margin: 0, color: "#2c2b28", fontSize: 26, fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: "#9a7556" }}>
              <BookOpenIcon />
            </span>
            Moji kursevi
          </h2>
          <p style={{ margin: "6px 0 0", color: "#8b7762", fontSize: 15 }}>
            Kursevi na koje si upisan
          </p>
        </div>

        {loading ? (
          <div style={loadingState}>
            <div style={{ marginBottom: 16, color: "#9a7556", display: "flex", justifyContent: "center" }}>
              <LoaderIcon />
            </div>
            Učitavanje...
          </div>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {courses.map((c) => (
              <Link
                key={c.id}
                to={`/courses/${c.id}`}
                style={courseLink}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 6px 18px rgba(39,35,30,0.08)";
                  (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 2px 8px rgba(39,35,30,0.04)";
                  (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                }}
              >
                <div style={courseName}>
                  <BookIcon />
                  {c.name}
                </div>
                <div style={professorInfo}>
                  <UserIcon />
                  {c.professorName}
                </div>
                <div style={courseDescription}>
                  {c.description}
                </div>
              </Link>
            ))}

            {courses.length === 0 && (
              <div style={emptyState}>
                <div style={{ marginBottom: 16, color: "#9a7556", display: "flex", justifyContent: "center" }}>
                  <BookmarkIcon />
                </div>
                Još nisi upisan ni na jedan kurs.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ----------------- Styles ----------------- */
const pageWrap: React.CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(180deg,#fbf7f2 0%,#f6f1ea 100%)",
  padding: 24,
};

const container: React.CSSProperties = {
  maxWidth: 900,
  margin: "0 auto",
  background: "#fff",
  borderRadius: 20,
  padding: 28,
  boxShadow: "0 20px 40px rgba(39,35,30,0.04)",
};

const errorContainer: React.CSSProperties = {
  maxWidth: 600,
  margin: "0 auto",
  background: "#fff",
  borderRadius: 20,
  padding: 60,
  textAlign: "center",
  color: "#8b7762",
  boxShadow: "0 20px 40px rgba(39,35,30,0.04)",
};

const header: React.CSSProperties = {
  marginBottom: 24,
  paddingBottom: 20,
  borderBottom: "2px solid #f5f0ea",
};

const loadingState: React.CSSProperties = {
  textAlign: "center",
  color: "#8b7762",
  padding: 40,
};

const courseLink: React.CSSProperties = {
  textDecoration: "none",
  color: "inherit",
  border: "1px solid rgba(44,43,40,0.06)",
  borderRadius: 16,
  padding: 20,
  background: "#fffaf6",
  display: "block",
  transition: "all 0.2s",
  boxShadow: "0 2px 8px rgba(39,35,30,0.04)",
};

const courseName: React.CSSProperties = {
  fontWeight: 700,
  fontSize: 17,
  color: "#2c2b28",
  marginBottom: 8,
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const professorInfo: React.CSSProperties = {
  color: "#8b7762",
  fontSize: 14,
  marginBottom: 10,
  display: "flex",
  alignItems: "center",
  gap: 6,
};

const courseDescription: React.CSSProperties = {
  color: "rgba(44,43,40,0.8)",
  fontSize: 14,
  lineHeight: 1.6,
};

const emptyState: React.CSSProperties = {
  textAlign: "center",
  padding: 60,
  color: "#8b7762",
  fontStyle: "italic",
  background: "#fffaf6",
  borderRadius: 16,
  boxShadow: "0 2px 8px rgba(39,35,30,0.04)",
};