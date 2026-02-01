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

  const pendingRequests = requests.filter(r => r.status === "PENDING");
  const rejectedRequests = requests.filter(r => r.status === "REJECTED");

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
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: 24,
            marginBottom: 24,
            boxShadow: "0 2px 8px rgba(39,35,30,0.04)",
          }}
        >
          <h2 style={{ margin: 0, color: "#2c2b28", fontSize: 26, fontWeight: 700 }}>
            📚 Moji kursevi
          </h2>
          <p style={{ margin: "6px 0 0", color: "#8b7762", fontSize: 15 }}>
            Upravljanje i status tvojih kurseva
          </p>
        </div>

        {loading ? (
          <div style={{ 
            textAlign: "center", 
            padding: 60,
            color: "#8b7762",
            fontSize: 16,
          }}>
            ⏳ Učitavanje...
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
            
            {/* Leva kolona - Aktivni kursevi */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              
              {/* Aktivni kursevi */}
              <div
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  padding: 24,
                  boxShadow: "0 2px 8px rgba(39,35,30,0.04)",
                  border: "2px solid rgba(6,95,70,0.1)",
                }}
              >
                <div style={{ 
                  marginBottom: 20,
                  paddingBottom: 16,
                  borderBottom: "2px solid #f0fdf4",
                }}>
                  <h3 style={{ 
                    margin: 0, 
                    color: "#2c2b28", 
                    fontSize: 20,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}>
                    ✅ Aktivni kursevi
                    <span style={{
                      fontSize: 14,
                      fontWeight: 700,
                      padding: "4px 12px",
                      borderRadius: 20,
                      background: "linear-gradient(135deg, #dcfce7, #bbf7d0)",
                      color: "#065f46",
                    }}>
                      {approvedCourses.length}
                    </span>
                  </h3>
                  <p style={{ margin: "4px 0 0", color: "#8b7762", fontSize: 14 }}>
                    Kursevi koji su odobreni i aktivni
                  </p>
                </div>

                <div style={{ display: "grid", gap: 14 }}>
                  {approvedCourses.length > 0 ? (
                    approvedCourses.map((c) => (
                      <div
                        key={c.id}
                        style={{
                          border: "2px solid rgba(6,95,70,0.15)",
                          borderRadius: 14,
                          padding: 18,
                          background: "linear-gradient(135deg, #f0fdf4 0%, #fff 100%)",
                          transition: "all 0.2s",
                          boxShadow: "0 2px 6px rgba(39,35,30,0.04)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow = "0 4px 12px rgba(39,35,30,0.08)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "0 2px 6px rgba(39,35,30,0.04)";
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: 16,
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontWeight: 700,
                                fontSize: 17,
                                color: "#2c2b28",
                                marginBottom: 6,
                              }}
                            >
                              📖 {c.name}
                            </div>
                            <div
                              style={{
                                color: "rgba(44,43,40,0.75)",
                                fontSize: 14,
                                lineHeight: 1.5,
                              }}
                            >
                              {c.description}
                            </div>
                          </div>

                          <Link
                            to={`/professor/courses/${c.id}/manage`}
                            style={{
                              padding: "10px 18px",
                              borderRadius: 10,
                              border: "none",
                              fontWeight: 600,
                              color: "#fff",
                              background: "linear-gradient(135deg,#d6bca3,#b99a7f)",
                              textDecoration: "none",
                              fontSize: 14,
                              whiteSpace: "nowrap",
                              boxShadow: "0 2px 8px rgba(121,86,61,0.2)",
                              transition: "all 0.2s",
                              display: "inline-block",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = "translateY(-1px)";
                              e.currentTarget.style.boxShadow = "0 4px 12px rgba(121,86,61,0.3)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow = "0 2px 8px rgba(121,86,61,0.2)";
                            }}
                          >
                            ⚙️ Upravljaj
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        padding: 40,
                        color: "#8b7762",
                        fontStyle: "italic",
                        fontSize: 14,
                      }}
                    >
                      Nemate aktivnih kurseva.
                    </div>
                  )}
                </div>
              </div>

              {/* Odbijeni zahtevi */}
              {rejectedRequests.length > 0 && (
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 16,
                    padding: 24,
                    boxShadow: "0 2px 8px rgba(39,35,30,0.04)",
                    border: "2px solid rgba(180,130,130,0.15)",
                  }}
                >
                  <div style={{ 
                    marginBottom: 20,
                    paddingBottom: 16,
                    borderBottom: "2px solid #fff5f5",
                  }}>
                    <h3 style={{ 
                      margin: 0, 
                      color: "#2c2b28", 
                      fontSize: 20,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}>
                      ❌ Odbijeni zahtevi
                      <span style={{
                        fontSize: 14,
                        fontWeight: 700,
                        padding: "4px 12px",
                        borderRadius: 20,
                        background: "#fee2e2",
                        color: "#7a2a2a",
                      }}>
                        {rejectedRequests.length}
                      </span>
                    </h3>
                  </div>

                  <div style={{ display: "grid", gap: 14 }}>
                    {rejectedRequests.map((c) => (
                      <div
                        key={c.id}
                        style={{
                          border: "1px solid rgba(180,130,130,0.2)",
                          borderRadius: 14,
                          padding: 18,
                          background: "#fffbfb",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 16,
                            color: "#2c2b28",
                            marginBottom: 4,
                          }}
                        >
                          {c.name}
                        </div>
                        <div
                          style={{
                            color: "#8b7762",
                            fontSize: 14,
                            marginBottom: 12,
                          }}
                        >
                          {c.description}
                        </div>
                        
                        {c.rejectionReason && (
                          <div
                            style={{
                              padding: 12,
                              borderRadius: 8,
                              background: "#fff5f5",
                              border: "1px solid rgba(122,42,42,0.15)",
                            }}
                          >
                            <div style={{ 
                              fontWeight: 600, 
                              color: "#7a2a2a", 
                              fontSize: 13,
                              marginBottom: 4,
                            }}>
                              💬 Razlog odbijanja:
                            </div>
                            <div style={{ color: "#7a2a2a", fontSize: 13 }}>
                              {c.rejectionReason}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Desna kolona - Zahtevi na čekanju */}
            <div>
              <div
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  padding: 20,
                  boxShadow: "0 2px 8px rgba(39,35,30,0.04)",
                  border: "2px solid rgba(214,188,163,0.2)",
                }}
              >
                <div style={{ 
                  marginBottom: 18,
                  paddingBottom: 14,
                  borderBottom: "2px solid #fff7e8",
                }}>
                  <h3 style={{ 
                    margin: 0, 
                    color: "#2c2b28", 
                    fontSize: 18,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}>
                    ⏳ Na čekanju
                    {pendingRequests.length > 0 && (
                      <span style={{
                        fontSize: 13,
                        fontWeight: 700,
                        padding: "3px 10px",
                        borderRadius: 20,
                        background: "#fff7e8",
                        color: "#7a5b32",
                        border: "1px solid rgba(122,91,50,0.2)",
                      }}>
                        {pendingRequests.length}
                      </span>
                    )}
                  </h3>
                  <p style={{ margin: "4px 0 0", color: "#8b7762", fontSize: 13 }}>
                    Zahtevi na pregledu
                  </p>
                </div>

                <div style={{ display: "grid", gap: 12 }}>
                  {pendingRequests.length > 0 ? (
                    pendingRequests.map((c) => (
                      <div
                        key={c.id}
                        style={{
                          border: "1px solid rgba(122,91,50,0.15)",
                          borderRadius: 12,
                          padding: 14,
                          background: "#fffcf5",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 15,
                            color: "#2c2b28",
                            marginBottom: 4,
                          }}
                        >
                          {c.name}
                        </div>
                        <div
                          style={{
                            color: "rgba(44,43,40,0.7)",
                            fontSize: 13,
                            lineHeight: 1.4,
                          }}
                        >
                          {c.description}
                        </div>

                        <div
                          style={{
                            marginTop: 10,
                            fontSize: 12,
                            fontWeight: 600,
                            padding: "6px 10px",
                            borderRadius: 20,
                            background: "#fff7e8",
                            color: "#7a5b32",
                            border: "1px solid rgba(122,91,50,0.2)",
                            display: "inline-block",
                          }}
                        >
                          ⏳ Na čekanju
                        </div>
                      </div>
                    ))
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        padding: 32,
                        color: "#8b7762",
                        fontStyle: "italic",
                        fontSize: 13,
                      }}
                    >
                      Nema zahteva na čekanju.
                    </div>
                  )}
                </div>
              </div>

              {/* Statistika */}
              <div
                style={{
                  marginTop: 24,
                  background: "linear-gradient(135deg, #fff 0%, #fafafa 100%)",
                  borderRadius: 16,
                  padding: 20,
                  boxShadow: "0 2px 8px rgba(39,35,30,0.04)",
                  border: "1px solid rgba(44,43,40,0.06)",
                }}
              >
                <h3 style={{ 
                  margin: "0 0 16px", 
                  color: "#2c2b28", 
                  fontSize: 17,
                  fontWeight: 700,
                  paddingBottom: 14,
                  borderBottom: "2px solid #f5f0ea",
                }}>
                  📊 Pregled
                </h3>
                
                <div style={{ display: "grid", gap: 12 }}>
                  <div style={{ 
                    padding: 14,
                    borderRadius: 10,
                    background: "#f0fdf4",
                    border: "1px solid rgba(6,95,70,0.1)",
                  }}>
                    <div style={{ fontSize: 12, color: "#065f46", marginBottom: 4, fontWeight: 600 }}>
                      Aktivni kursevi
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: "#065f46" }}>
                      {approvedCourses.length}
                    </div>
                  </div>

                  <div style={{ 
                    padding: 14,
                    borderRadius: 10,
                    background: "#fffcf5",
                    border: "1px solid rgba(122,91,50,0.1)",
                  }}>
                    <div style={{ fontSize: 12, color: "#7a5b32", marginBottom: 4, fontWeight: 600 }}>
                      Na čekanju
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: "#7a5b32" }}>
                      {pendingRequests.length}
                    </div>
                  </div>

                  <div style={{ 
                    padding: 14,
                    borderRadius: 10,
                    background: "#fff5f5",
                    border: "1px solid rgba(180,130,130,0.1)",
                  }}>
                    <div style={{ fontSize: 12, color: "#7a2a2a", marginBottom: 4, fontWeight: 600 }}>
                      Odbijeni
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: "#7a2a2a" }}>
                      {rejectedRequests.length}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}