import { useEffect, useMemo, useState } from "react";
import type { Course } from "../types/courses";
import { listProfessors, listCourses } from "../mocks/handlers";
import { SearchBar } from "../components/SearchBar";
import { ProfessorSelect } from "../components/ProfessorSelect";
import { CourseCard } from "../components/CourseCard";
import { createEnrollment } from "../mocks/enrollments";
import { useAuth } from "../auth/AuthContext";

const tabs: { key: Course["status"] | "OPEN"; label: string }[] = [
  { key: "ACTIVE", label: "Aktivni" },
  { key: "PENDING", label: "Na čekanju" },
  { key: "OPEN", label: "Svi" },
];

export default function CoursesPage() {
  const [active, setActive] = useState<Course["status"] | "OPEN">("ACTIVE");
  const [professors, setProfessors] = useState<{ id: number; name: string }[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [professorId, setProfessorId] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, hasRole } = useAuth();
  const [processingIds, setProcessingIds] = useState<number[]>([]);

  useEffect(() => {
    listProfessors().then(setProfessors);
  }, []);

  useEffect(() => {
    setLoading(true);

    const status = active === "OPEN" ? undefined : active;
    listCourses({ status: status as any, search, professorId })
      .then((data) => setCourses(data))
      .finally(() => setLoading(false));
  }, [active, search, professorId]);

  const gridStyle = useMemo(
    () => ({
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: 16,
      marginTop: 18,
    }),
    []
  );

  const handleEnroll = async (courseId: number) => {
    if (!user || !hasRole(["STUDENT"])) return;

    setProcessingIds((p) => [...p, courseId]);
    try {
      await createEnrollment(courseId);
      alert("Uspešno ste upisani na kurs (mock).");
    } finally {
      setProcessingIds((p) => p.filter((id) => id !== courseId));
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea, #764ba2)",
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
          boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ margin: 0, color: "#2d2d2d" }}>🎓 Kursevi</h2>
          <p style={{ margin: "6px 0 0", color: "#666" }}>
            Istraži dostupne kurseve i započni učenje
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              style={{
                padding: "8px 16px",
                borderRadius: 999,
                border: "1px solid #ddd",
                fontWeight: 500,
                background:
                  active === t.key
                    ? "linear-gradient(135deg, #667eea, #764ba2)"
                    : "#fff",
                color: active === t.key ? "#fff" : "#333",
                cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: 14,
            marginTop: 18,
          }}
        >
          <SearchBar value={search} onChange={setSearch} />
          <ProfessorSelect
            professors={professors}
            value={professorId}
            onChange={setProfessorId}
          />
        </div>

        {/* Content */}
        {loading ? (
          <div
            style={{
              marginTop: 24,
              textAlign: "center",
              color: "#666",
            }}
          >
            Učitavanje…
          </div>
        ) : (
          <div style={gridStyle}>
            {courses.map((c) => (
              <CourseCard
                key={c.id}
                course={c}
                onEnroll={handleEnroll}
                isEnrolling={processingIds.includes(c.id)}
              />
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
                Nema kurseva za izabrani filter.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
