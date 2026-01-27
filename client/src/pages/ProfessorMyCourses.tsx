import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { http } from "../api/https";
import { endpoints } from "../api/endpoints";
import type { CourseRequest, Course } from "../types/courses";
import { useAuth } from "../auth/AuthContext";

export default function ProfessorMyCoursesPage() {
  const { user, hasRole } = useAuth();
  const [requests, setRequests] = useState<CourseRequest[]>([]);
  const [approvedCourses, setApprovedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !hasRole(["PROFESOR"])) return;
    fetchMyRequests();
    fetchApprovedCourses();
  }, [user]);

  const fetchMyRequests = async () => {
    setLoading(true);
    try {
      const res = await http.get(endpoints.courses.myRequests);
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovedCourses = async () => {
    try {
      const res = await http.get(endpoints.courses.list);
      const allCourses = res.data as Course[];
      
      const myCourses = allCourses.filter(c => c.professorId === user?.id);
      setApprovedCourses(myCourses);
    } catch (err) {
      console.error(err);
    }
  };

  if (!user || !hasRole(["PROFESOR"])) {
    return <div style={{ padding: 16 }}>Nemate pristup ovoj stranici.</div>;
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
          <h2 style={{ margin: 0, color: "#2c2b28" }}>📚 Moji kursevi</h2>
          <p style={{ margin: "6px 0 0", color: "#8b7762" }}>
            Upravljanje i status tvojih kurseva
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", color: "#8b7762" }}>Učitavanje...</div>
        ) : (
          <>
            {approvedCourses.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <h3 style={{ margin: "0 0 16px", color: "#2c2b28", fontSize: 18 }}>
                  ✅ Aktivni kursevi ({approvedCourses.length})
                </h3>
                <div style={{ display: "grid", gap: 16 }}>
                  {approvedCourses.map((c) => (
                    <div
                      key={c.id}
                      style={{
                        border: "1px solid rgba(44,43,40,0.06)",
                        borderRadius: 16,
                        padding: 18,
                        background: "#e9fbf4",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: 12,
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: 16,
                              color: "#2c2b28",
                            }}
                          >
                            {c.name}
                          </div>
                          <div
                            style={{
                              marginTop: 4,
                              color: "#8b7762",
                              fontSize: 14,
                            }}
                          >
                            {c.description}
                          </div>
                        </div>

                        <Link
                          to={`/professor/courses/${c.id}/manage`}
                          style={{
                            padding: "8px 16px",
                            borderRadius: 10,
                            border: "none",
                            fontWeight: 600,
                            color: "#fff",
                            background: "linear-gradient(135deg,#d6bca3,#b99a7f)",
                            textDecoration: "none",
                            fontSize: 13,
                            whiteSpace: "nowrap",
                          }}
                        >
                          ⚙️ Upravljaj
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 style={{ margin: "0 0 16px", color: "#2c2b28", fontSize: 18 }}>
                📋 Zahtevi za kurseve
              </h3>
              <div style={{ display: "grid", gap: 16 }}>
                {requests.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      border: "1px solid rgba(44,43,40,0.06)",
                      borderRadius: 16,
                      padding: 18,
                      background: "#fffaf6",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 12,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 16,
                            color: "#2c2b28",
                          }}
                        >
                          {c.name}
                        </div>
                        <div
                          style={{
                            marginTop: 4,
                            color: "#8b7762",
                            fontSize: 14,
                          }}
                        >
                          {c.description}
                        </div>
                      </div>

                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          padding: "4px 10px",
                          borderRadius: 999,
                          background:
                            c.status === "APPROVED"
                              ? "#e9fbf4"
                              : c.status === "PENDING"
                              ? "#fff7e8"
                              : "#fff5f5",
                          color:
                            c.status === "APPROVED"
                              ? "#065f46"
                              : c.status === "PENDING"
                              ? "#7a5b32"
                              : "#7a2a2a",
                          border: "1px solid rgba(44,43,40,0.04)",
                        }}
                      >
                        {c.status === "PENDING" && "⏳ NA ČEKANJU"}
                        {c.status === "APPROVED" && "✅ ODOBREN"}
                        {c.status === "REJECTED" && "❌ ODBIJEN"}
                      </div>
                    </div>

                    {c.status === "REJECTED" && c.rejectionReason && (
                      <div
                        style={{
                          marginTop: 12,
                          padding: 10,
                          borderRadius: 8,
                          background: "#fff5f5",
                          border: "1px solid rgba(122,42,42,0.08)",
                          color: "#7a2a2a",
                          fontSize: 13,
                        }}
                      >
                        <strong>Razlog odbijanja:</strong> {c.rejectionReason}
                      </div>
                    )}
                  </div>
                ))}

                {requests.length === 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: 24,
                      color: "#777",
                      fontStyle: "italic",
                    }}
                  >
                    Nema zahteva za kurseve.
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}