import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { http } from "../api/https";
import { endpoints } from "../api/endpoints";
import type { Course } from "../types/courses";
import { useAuth } from "../auth/AuthContext";

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
    return <div style={{ padding: 16 }}>Nemaš pristup ovoj stranici.</div>;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#fbf7f2 0%,#f6f1ea 100%)",
        padding: 24,
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          background: "#fff",
          borderRadius: 20,
          padding: 28,
          boxShadow: "0 20px 40px rgba(39,35,30,0.04)",
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ margin: 0, color: "#2c2b28" }}>📘 Moji kursevi</h2>
          <p style={{ margin: "6px 0 0", color: "#8b7762" }}>
            Kursevi na koje si upisan
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", color: "#8b7762" }}>Učitavanje...</div>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {courses.map((c) => (
              <Link
                key={c.id}
                to={`/courses/${c.id}`}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  border: "1px solid rgba(44,43,40,0.06)",
                  borderRadius: 16,
                  padding: 18,
                  background: "#fffaf6",
                  display: "block",
                  transition: "all 0.12s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 6px 18px rgba(39,35,30,0.06)";
                  (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none";
                  (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 16,
                    color: "#2c2b28",
                  }}
                >
                  {c.name}
                </div>
                <div style={{ color: "#8b7762", fontSize: 13, marginTop: 4 }}>
                  {c.professorName}
                </div>
                <div
                  style={{
                    marginTop: 8,
                    color: "rgba(44,43,40,0.8)",
                    fontSize: 14,
                    lineHeight: 1.5,
                  }}
                >
                  {c.description}
                </div>
              </Link>
            ))}

            {courses.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: 24,
                  color: "#777",
                  fontStyle: "italic",
                }}
              >
                Još nisi upisan ni na jedan kurs.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
