import { useEffect, useState } from "react";
import { http } from "../api/https";
import { endpoints } from "../api/endpoints";
import type { Course } from "../types/courses";
import { SearchBar } from "../components/SearchBar";
import { CourseCard } from "../components/CourseCard";
import { useAuth } from "../auth/AuthContext";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, hasRole } = useAuth();
  const [processingIds, setProcessingIds] = useState<number[]>([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await http.get("/api/courses/");
      console.log("Fetched courses:", res.data); // ✅ DEBUG
      setCourses(res.data);
    } catch (err: any) {
      console.error("Error fetching courses:", err);
      setError(err?.response?.data?.error || "Greška pri učitavanju kurseva");
    } finally {
      setLoading(false);
    }
  };

  const filtered = courses.filter((c) =>
    search
      ? c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.professorName.toLowerCase().includes(search.toLowerCase())
      : true
  );

  const handleEnroll = async (courseId: number) => {
    if (!user || !hasRole(["STUDENT"])) return;

    setProcessingIds((p) => [...p, courseId]);
    try {
      await http.post(endpoints.courses.enroll(courseId));
      alert("Uspešno ste upisani na kurs!");
      fetchCourses(); 
    } catch (err: any) {
      alert(err?.response?.data?.error ?? "Greška pri upisu.");
    } finally {
      setProcessingIds((p) => p.filter((id) => id !== courseId));
    }
  };

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
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ margin: 0, color: "#2c2b28" }}>🎓 Kursevi</h2>
          <p style={{ margin: "6px 0 0", color: "#8b7762" }}>
            Istraži dostupne kurseve i započni učenje
          </p>
        </div>

        <div style={{ marginBottom: 18 }}>
          <SearchBar value={search} onChange={setSearch} />
        </div>

        {error && (
          <div
            style={{
              padding: 16,
              marginBottom: 16,
              background: "#fff5f5",
              border: "1px solid rgba(180,130,130,0.08)",
              borderRadius: 8,
              color: "#7a2a2a",
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div
            style={{
              marginTop: 24,
              textAlign: "center",
              color: "#8b7762",
            }}
          >
            Učitavanje...
          </div>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {filtered.map((c) => (
              <CourseCard
                key={c.id}
                course={c}
                onEnroll={handleEnroll}
                isEnrolling={processingIds.includes(c.id)}
              />
            ))}

            {filtered.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: 24,
                  color: "#777",
                  fontStyle: "italic",
                }}
              >
                {courses.length === 0
                  ? "Trenutno nema dostupnih kurseva."
                  : "Nema kurseva za izabrani filter."}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
