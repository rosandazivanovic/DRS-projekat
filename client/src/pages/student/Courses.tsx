import { useEffect, useState } from "react";
import { http } from "../../api/https";
import { endpoints } from "../../api/endpoints";
import type { Course } from "../../types/courses";
import { SearchBar } from "../../components/SearchBar";
import { CourseCard } from "../../components/CourseCard";
import { useAuth } from "../../auth/AuthContext";

const GraduationCapIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const XCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/>
    <line x1="9" y1="9" x2="15" y2="15"/>
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

const SearchIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
);

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "enrolled" | "not-enrolled">("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, hasRole } = useAuth();
  const [processingIds, setProcessingIds] = useState<number[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
    if (hasRole(["STUDENT"])) {
      fetchEnrolledCourses();
    }
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await http.get("/api/courses/");
      console.log("Fetched courses:", res.data);
      setCourses(res.data);
    } catch (err: any) {
      console.error("Error fetching courses:", err);
      setError(err?.response?.data?.error || "Greška pri učitavanju kurseva");
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrolledCourses = async () => {
    try {
      const res = await http.get(endpoints.courses.myCourses);
      const enrolledIds = new Set<number>(res.data.map((c: Course) => c.id));
      setEnrolledCourseIds(enrolledIds);
    } catch (err: any) {
      console.error("Error fetching enrolled courses:", err);
    }
  };

  const filtered = courses.filter((c) => {
    const matchesSearch = search
      ? c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.professorName.toLowerCase().includes(search.toLowerCase())
      : true;
    
    const matchesFilter = 
      filter === "enrolled" ? enrolledCourseIds.has(c.id) :
      filter === "not-enrolled" ? !enrolledCourseIds.has(c.id) :
      true;
    
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    const aEnrolled = enrolledCourseIds.has(a.id);
    const bEnrolled = enrolledCourseIds.has(b.id);
    
    if (aEnrolled === bEnrolled) return 0;
    return aEnrolled ? 1 : -1;
  });

  const enrolledCount = courses.filter(c => enrolledCourseIds.has(c.id)).length;
  const notEnrolledCount = courses.filter(c => !enrolledCourseIds.has(c.id)).length;

  const handleEnroll = async (courseId: number) => {
    if (!user || !hasRole(["STUDENT"])) return;

    setProcessingIds((p) => [...p, courseId]);
    setSuccessMessage(null);
    try {
      await http.post(endpoints.courses.enroll(courseId));
      setSuccessMessage("Uspešno ste upisani na kurs!");
      setTimeout(() => setSuccessMessage(null), 3000);
      await fetchEnrolledCourses();
      await fetchCourses(); 
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Greška pri upisu.");
      setTimeout(() => setError(null), 3000);
    } finally {
      setProcessingIds((p) => p.filter((id) => id !== courseId));
    }
  };

  return (
    <div style={pageWrap}>
      <div style={container}>
        {/* Header + Search */}
        <div style={headerCard}>
          <div style={headerContent}>
            <h2 style={{ margin: 0, color: "#63628B", fontSize: 26, fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: "#56629A" }}>
                <GraduationCapIcon />
              </span>
              Kursevi
            </h2>
            <p style={{ margin: "6px 0 0", color: "#8B7762", fontSize: 15 }}>
              Istraži dostupne kurseve i započni učenje
            </p>
          </div>

          <div style={{ marginTop: 20 }}>
            <SearchBar value={search} onChange={setSearch} />
          </div>

          {/* Filter Buttons */}
          {hasRole(["STUDENT"]) && (
            <div style={filterSection}>
              <span style={filterLabel}>
                Filtriraj:
              </span>
              {(["all", "enrolled", "not-enrolled"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    ...filterButton,
                    ...(filter === f ? filterButtonActive : {}),
                  }}
                >
                  {f === "all" && `Svi (${courses.length})`}
                  {f === "enrolled" && `Upisani (${enrolledCount})`}
                  {f === "not-enrolled" && `Neupisani (${notEnrolledCount})`}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Success Message */}
        {successMessage && (
          <div style={successBanner}>
            <CheckCircleIcon />
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={errorBanner}>
            <XCircleIcon />
            {error}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div style={loadingState}>
            <div style={{ marginBottom: 16, color: "#56629A", display: "flex", justifyContent: "center" }}>
              <LoaderIcon />
            </div>
            Učitavanje kurseva...
          </div>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {filtered.map((c) => (
              <CourseCard
                key={c.id}
                course={c}
                onEnroll={handleEnroll}
                isEnrolling={processingIds.includes(c.id)}
                isEnrolled={enrolledCourseIds.has(c.id)}
              />
            ))}

            {filtered.length === 0 && (
              <div style={emptyState}>
                <div style={{ marginBottom: 16, color: "#56629A", display: "flex", justifyContent: "center" }}>
                  <SearchIcon />
                </div>
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

/* ----------------- Styles ----------------- */
const pageWrap: React.CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #F3F2FB 0%, #FBF7F2 100%)",
  padding: 24,
};

const container: React.CSSProperties = {
  maxWidth: 1000,
  margin: "0 auto",
};

const headerCard: React.CSSProperties = {
  background: "#FFFFFF",
  borderRadius: 16,
  padding: 24,
  marginBottom: 20,
  boxShadow: "0 2px 8px rgba(99,98,139,0.06)",
};

const headerContent: React.CSSProperties = {
  marginBottom: 20,
};

const filterSection: React.CSSProperties = {
  marginTop: 16,
  paddingTop: 16,
  borderTop: "2px solid #F3F2FB",
  display: "flex",
  gap: 12,
  alignItems: "center",
  flexWrap: "wrap",
};

const filterLabel: React.CSSProperties = {
  fontWeight: 600,
  color: "#63628B",
  fontSize: 14,
  marginRight: 8,
};

const filterButton: React.CSSProperties = {
  padding: "8px 16px",
  borderRadius: 10,
  border: "1px solid rgba(86,98,154,0.15)",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 13,
  color: "#63628B",
  background: "#FFFFFF",
  transition: "all 0.2s",
};

const filterButtonActive: React.CSSProperties = {
  border: "none",
  color: "#FFFFFF",
  background: "linear-gradient(135deg, #56629A, #63628B)",
  boxShadow: "0 2px 8px rgba(86,98,154,0.2)",
};

const successBanner: React.CSSProperties = {
  padding: 14,
  marginBottom: 16,
  background: "linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%)",
  border: "1px solid rgba(6,95,70,0.12)",
  borderRadius: 12,
  color: "#065f46",
  fontWeight: 600,
  fontSize: 14,
  display: "flex",
  alignItems: "center",
  gap: 10,
  boxShadow: "0 2px 8px rgba(6,95,70,0.08)",
};

const errorBanner: React.CSSProperties = {
  padding: 14,
  marginBottom: 16,
  background: "#fff5f5",
  border: "1px solid rgba(220,38,38,0.12)",
  borderRadius: 12,
  color: "#991b1b",
  fontWeight: 600,
  fontSize: 14,
  display: "flex",
  alignItems: "center",
  gap: 10,
  boxShadow: "0 2px 8px rgba(220,38,38,0.08)",
};

const loadingState: React.CSSProperties = {
  background: "#FFFFFF",
  borderRadius: 16,
  padding: 60,
  textAlign: "center",
  color: "#8B7762",
  boxShadow: "0 2px 8px rgba(99,98,139,0.06)",
};

const emptyState: React.CSSProperties = {
  background: "#FFFFFF",
  borderRadius: 16,
  padding: 60,
  textAlign: "center",
  color: "#8B7762",
  fontStyle: "italic",
  boxShadow: "0 2px 8px rgba(99,98,139,0.06)",
};