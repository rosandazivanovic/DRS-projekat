import { useEffect, useState } from "react";
import { http } from "../api/https";
import { endpoints } from "../api/endpoints";
import type { TaskSubmission } from "../types/tasks";

export default function MySubmissionsPage() {
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "graded" | "pending">("all");

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await http.get(endpoints.tasks.mySubmissions);
      setSubmissions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = submissions.filter((s) => {
    if (filter === "graded") return s.grade !== null;
    if (filter === "pending") return s.grade === null;
    return true;
  });

  // Statistika
  const gradedSubmissions = submissions.filter(s => s.grade !== null);
  const averageGrade = gradedSubmissions.length > 0
    ? (gradedSubmissions.reduce((sum, s) => sum + (s.grade || 0), 0) / gradedSubmissions.length).toFixed(2)
    : "0.00";
  const pendingCount = submissions.filter(s => s.grade === null).length;

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
        <div style={{ 
          marginBottom: 24,
          background: "#fff",
          padding: 20,
          borderRadius: 16,
          boxShadow: "0 2px 8px rgba(39,35,30,0.04)",
        }}>
          <h2 style={{ margin: 0, color: "#2c2b28", fontSize: 24 }}>
            📋 Moja rešenja
          </h2>
          <p style={{ margin: "6px 0 0", color: "#8b7762", fontSize: 14 }}>
            Pregled svih predatih zadataka i ocena
          </p>
        </div>

        {/* Grid layout - 2 kolone */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "2fr 1fr",
          gap: 24,
        }}>
          {/* Leva kolona - Rešenja */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            
            {/* Filter i rešenja */}
            <div
              style={{
                padding: 24,
                border: "1px solid rgba(44,43,40,0.06)",
                borderRadius: 16,
                background: "#fff",
                boxShadow: "0 2px 8px rgba(39,35,30,0.04)",
              }}
            >
              {/* Filter */}
              <div style={{ 
                marginBottom: 20, 
                paddingBottom: 16,
                borderBottom: "2px solid #f5f0ea",
                display: "flex", 
                gap: 12,
                alignItems: "center",
              }}>
                <span style={{ fontWeight: 600, color: "#2c2b28", fontSize: 14, marginRight: 8 }}>
                  Filtriraj:
                </span>
                {(["all", "graded", "pending"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 10,
                      border: filter === f ? "none" : "1px solid rgba(44,43,40,0.12)",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: 13,
                      color: filter === f ? "#fff" : "#2c2b28",
                      background: filter === f
                        ? "linear-gradient(135deg,#d6bca3,#b99a7f)"
                        : "#fff",
                      transition: "all 0.2s",
                    }}
                  >
                    {f === "all" && `Sva (${submissions.length})`}
                    {f === "graded" && `Ocenjeni (${gradedSubmissions.length})`}
                    {f === "pending" && `Na čekanju (${pendingCount})`}
                  </button>
                ))}
              </div>

              {loading ? (
                <div style={{ 
                  textAlign: "center", 
                  color: "#8b7762",
                  padding: 40,
                }}>
                  ⏳ Učitavanje...
                </div>
              ) : (
                <div style={{ display: "grid", gap: 14 }}>
                  {filtered.map((s) => (
                    <div
                      key={s.id}
                      style={{
                        padding: 18,
                        border: "1px solid rgba(44,43,40,0.06)",
                        borderRadius: 12,
                        background: s.grade ? "#f0fdf4" : "#fafafa",
                        transition: "all 0.2s",
                      }}
                    >
                      {/* Header */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: 12,
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: 16,
                              color: "#2c2b28",
                              marginBottom: 6,
                            }}
                          >
                            {s.taskTitle}
                          </div>
                          <div
                            style={{
                              fontSize: 13,
                              color: "#8b7762",
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            🕐 Predato: {new Date(s.submittedAt).toLocaleString('sr-RS', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>

                        {/* Status badge */}
                        <div
                          style={{
                            padding: "6px 14px",
                            borderRadius: 20,
                            fontSize: 12,
                            fontWeight: 600,
                            background: s.grade ? "#dcfce7" : "#fff7e8",
                            color: s.grade ? "#065f46" : "#7a5b32",
                            border: `1px solid ${s.grade ? "rgba(6,95,70,0.12)" : "rgba(122,91,50,0.12)"}`,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {s.grade ? "✅ Ocenjeno" : "⏳ Na čekanju"}
                        </div>
                      </div>

                      {/* File path */}
                      <div
                        style={{
                          fontSize: 14,
                          color: "rgba(44,43,40,0.8)",
                          marginBottom: s.grade ? 12 : 0,
                          padding: 10,
                          background: "#fff",
                          borderRadius: 8,
                          border: "1px solid rgba(44,43,40,0.06)",
                        }}
                      >
                        📄 Fajl:{" "}
                        <code
                          style={{
                            background: "#f5f5f5",
                            padding: "3px 8px",
                            borderRadius: 6,
                            fontWeight: 600,
                            color: "#2c2b28",
                          }}
                        >
                          {s.filePath.split('/')[0]}
                        </code>
                      </div>

                      {/* Grade details */}
                      {s.grade && (
                        <div
                          style={{
                            padding: 14,
                            borderRadius: 10,
                            background: "#fff",
                            border: "1px solid rgba(6,95,70,0.12)",
                            display: "flex",
                            gap: 14,
                            alignItems: "flex-start",
                          }}
                        >
                          {/* Leva strana - Komentar ili datum */}
                          <div style={{ flex: 1 }}>
                            {s.comment ? (
                              <div>
                                <div
                                  style={{
                                    fontSize: 11,
                                    color: "#047857",
                                    marginBottom: 6,
                                    fontWeight: 600,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px",
                                  }}
                                >
                                  💬 Komentar profesora
                                </div>
                                <div
                                  style={{
                                    fontSize: 13,
                                    color: "#065f46",
                                    lineHeight: 1.6,
                                  }}
                                >
                                  {s.comment}
                                </div>
                              </div>
                            ) : (
                              s.gradedAt && (
                                <div>
                                  <div style={{ fontSize: 10, color: "#8b7762", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>
                                    Ocenjeno
                                  </div>
                                  <div style={{ fontSize: 12, color: "#065f46", fontWeight: 600 }}>
                                    {new Date(s.gradedAt).toLocaleString('sr-RS', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </div>
                                </div>
                              )
                            )}
                          </div>

                          {/* Desna strana - Ocena */}
                          <div style={{
                            padding: "8px 14px",
                            borderRadius: 8,
                            background: "linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%)",
                            border: "1px solid rgba(6,95,70,0.15)",
                            boxShadow: "0 1px 3px rgba(6,95,70,0.08)",
                            minWidth: 80,
                            textAlign: "center",
                          }}>
                            <div
                              style={{
                                fontSize: 10,
                                color: "#047857",
                                marginBottom: 2,
                                fontWeight: 600,
                                letterSpacing: "0.5px",
                                textTransform: "uppercase",
                              }}
                            >
                              Ocena
                            </div>
                            <div
                              style={{
                                fontSize: 22,
                                fontWeight: 700,
                                color: "#065f46",
                                letterSpacing: "-0.5px",
                                lineHeight: 1,
                              }}
                            >
                              {s.grade}/5
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {filtered.length === 0 && (
                    <div
                      style={{
                        textAlign: "center",
                        padding: 60,
                        color: "#8b7762",
                        fontStyle: "italic",
                        background: "#fafafa",
                        borderRadius: 12,
                        border: "1px solid rgba(44,43,40,0.06)",
                      }}
                    >
                      <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                      {filter === "graded" && "Nema ocenjenih rešenja."}
                      {filter === "pending" && "Nema rešenja na čekanju."}
                      {filter === "all" && "Još niste predali nijedno rešenje."}
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Desna kolona - Statistika */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            
            {/* Statistika */}
            <div
              style={{
                padding: 20,
                border: "1px solid rgba(44,43,40,0.06)",
                borderRadius: 16,
                background: "linear-gradient(135deg, #fff 0%, #fafafa 100%)",
                boxShadow: "0 2px 8px rgba(39,35,30,0.04)",
              }}
            >
              <h3 style={{ 
                margin: "0 0 16px", 
                color: "#2c2b28", 
                fontSize: 17,
                paddingBottom: 14,
                borderBottom: "2px solid #f5f0ea",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}>
                📊 Statistika
              </h3>
              
              <div style={{ display: "grid", gap: 12 }}>
                <div style={{ 
                  padding: 14,
                  borderRadius: 10,
                  background: "#fff",
                  border: "1px solid rgba(44,43,40,0.06)",
                }}>
                  <div style={{ fontSize: 12, color: "#8b7762", marginBottom: 6, fontWeight: 600 }}>
                    Ukupno rešenja
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: "#2c2b28" }}>
                    {submissions.length}
                  </div>
                </div>

                <div style={{ 
                  padding: 14,
                  borderRadius: 10,
                  background: "#f0fdf4",
                  border: "1px solid rgba(6,95,70,0.12)",
                }}>
                  <div style={{ fontSize: 12, color: "#047857", marginBottom: 6, fontWeight: 600 }}>
                    Ocenjeno
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: "#065f46" }}>
                    {gradedSubmissions.length}
                  </div>
                </div>

                <div style={{ 
                  padding: 14,
                  borderRadius: 10,
                  background: "#fff7e8",
                  border: "1px solid rgba(122,91,50,0.12)",
                }}>
                  <div style={{ fontSize: 12, color: "#7a5b32", marginBottom: 6, fontWeight: 600 }}>
                    Na čekanju
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: "#7a5b32" }}>
                    {pendingCount}
                  </div>
                </div>

                {gradedSubmissions.length > 0 && (
                  <div style={{ 
                    padding: 14,
                    borderRadius: 10,
                    background: "linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%)",
                    border: "1px solid rgba(6,95,70,0.12)",
                  }}>
                    <div style={{ fontSize: 12, color: "#047857", marginBottom: 6, fontWeight: 600 }}>
                      Prosečna ocena
                    </div>
                    <div style={{ 
                      fontSize: 32, 
                      fontWeight: 700, 
                      color: "#065f46",
                    }}>
                      {averageGrade}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Napredak */}
            {submissions.length > 0 && (
              <div
                style={{
                  padding: 20,
                  border: "1px solid rgba(44,43,40,0.06)",
                  borderRadius: 16,
                  background: "#fff",
                  boxShadow: "0 2px 8px rgba(39,35,30,0.04)",
                }}
              >
                <h3 style={{ 
                  margin: "0 0 16px", 
                  color: "#2c2b28", 
                  fontSize: 17,
                  paddingBottom: 14,
                  borderBottom: "2px solid #f5f0ea",
                }}>
                  📈 Napredak
                </h3>
                
                <div style={{ marginBottom: 16 }}>
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}>
                    <span style={{ fontSize: 13, color: "#8b7762", fontWeight: 600 }}>
                      Ocenjeno zadataka
                    </span>
                    <span style={{ fontSize: 13, color: "#065f46", fontWeight: 700 }}>
                      {gradedSubmissions.length}/{submissions.length}
                    </span>
                  </div>
                  <div style={{
                    height: 10,
                    background: "#f0f0f0",
                    borderRadius: 10,
                    overflow: "hidden",
                  }}>
                    <div style={{
                      height: "100%",
                      width: `${(gradedSubmissions.length / submissions.length) * 100}%`,
                      background: "linear-gradient(90deg, #10b981, #059669)",
                      transition: "width 0.3s ease",
                    }} />
                  </div>
                </div>

                <div style={{ 
                  padding: 12,
                  borderRadius: 8,
                  background: "#f9f6f2",
                  fontSize: 13,
                  color: "#8b7762",
                  lineHeight: 1.5,
                }}>
                  💡 <strong>Savет:</strong> Nastavite predavati zadatke i pratite svoj napredak!
                </div>
              </div>
            )}

            {/* Raspodela ocena */}
            {gradedSubmissions.length > 0 && (
              <div
                style={{
                  padding: 20,
                  border: "1px solid rgba(44,43,40,0.06)",
                  borderRadius: 16,
                  background: "#fff",
                  boxShadow: "0 2px 8px rgba(39,35,30,0.04)",
                }}
              >
                <h3 style={{ 
                  margin: "0 0 16px", 
                  color: "#2c2b28", 
                  fontSize: 17,
                  paddingBottom: 14,
                  borderBottom: "2px solid #f5f0ea",
                }}>
                  🎯 Raspodela ocena
                </h3>
                
                <div style={{ display: "grid", gap: 10 }}>
                  {[5, 4, 3, 2, 1].map(grade => {
                    const count = gradedSubmissions.filter(s => s.grade === grade).length;
                    const percentage = (count / gradedSubmissions.length) * 100;
                    
                    return (
                      <div key={grade} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ 
                          fontSize: 14, 
                          fontWeight: 700, 
                          color: "#2c2b28",
                          minWidth: 30,
                        }}>
                          {grade}⭐
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            height: 8,
                            background: "#f0f0f0",
                            borderRadius: 10,
                            overflow: "hidden",
                          }}>
                            <div style={{
                              height: "100%",
                              width: `${percentage}%`,
                              background: grade >= 4 
                                ? "linear-gradient(90deg, #10b981, #059669)" 
                                : grade >= 3 
                                ? "linear-gradient(90deg, #f59e0b, #d97706)"
                                : "linear-gradient(90deg, #ef4444, #dc2626)",
                              transition: "width 0.3s ease",
                            }} />
                          </div>
                        </div>
                        <div style={{ 
                          fontSize: 13, 
                          fontWeight: 600, 
                          color: "#8b7762",
                          minWidth: 30,
                          textAlign: "right",
                        }}>
                          {count}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}