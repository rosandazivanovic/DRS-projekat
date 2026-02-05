import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { http } from "../../api/https";
import { endpoints } from "../../api/endpoints";
import type { Course } from "../../types/courses";
import { useAuth } from "../../auth/AuthContext";

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
          <div style={{ fontSize: 48, marginBottom: 12 }}>🚫</div>
          Nemaš pristup ovoj stranici.
        </div>
      </div>
    );
  }

  return (
    <div style={pageWrap}>
      <div style={container}>
        <div style={header}>
          <h2 style={{ margin: 0, color: "#2c2b28", fontSize: 26, fontWeight: 700 }}>
            📘 Moji kursevi
          </h2>
          <p style={{ margin: "6px 0 0", color: "#8b7762", fontSize: 15 }}>
            Kursevi na koje si upisan
          </p>
        </div>

        {loading ? (
          <div style={loadingState}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
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
                  📖 {c.name}
                </div>
                <div style={professorInfo}>
                  👨‍🏫 {c.professorName}
                </div>
                <div style={courseDescription}>
                  {c.description}
                </div>
              </Link>
            ))}

            {courses.length === 0 && (
              <div style={emptyState}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📚</div>
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