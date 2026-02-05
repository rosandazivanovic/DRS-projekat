import { useEffect, useState } from "react";
import { http } from "../../api/https";
import { endpoints } from "../../api/endpoints";
import type { TaskSubmission } from "../../types/tasks";

const ClipboardCheckIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <path d="M9 14l2 2 4-4"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const HourglassIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 22h14"/>
    <path d="M5 2h14"/>
    <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/>
    <path d="M7 22v-4.172a2 2 0 0 1 .586-1.414L12 12 7.586 7.586A2 2 0 0 1 7 6.172V2"/>
  </svg>
);

const FileTextIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);

const MessageCircleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
  </svg>
);

const BarChartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="20" x2="12" y2="10"/>
    <line x1="18" y1="20" x2="18" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="16"/>
  </svg>
);

const TrendingUpIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);

const TargetIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
);

const InboxIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
  </svg>
);

const LightbulbIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="9" y1="18" x2="15" y2="18"/>
    <line x1="10" y1="22" x2="14" y2="22"/>
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
  </svg>
);

const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

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

  const gradedSubmissions = submissions.filter(s => s.grade !== null);
  const averageGrade = gradedSubmissions.length > 0
    ? (gradedSubmissions.reduce((sum, s) => sum + (s.grade || 0), 0) / gradedSubmissions.length).toFixed(2)
    : "0.00";
  const pendingCount = submissions.filter(s => s.grade === null).length;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #F3F2FB 0%, #FBF7F2 100%)",
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
          background: "#FFFFFF",
          padding: 20,
          borderRadius: 16,
          boxShadow: "0 2px 8px rgba(99,98,139,0.06)",
        }}>
          <h2 style={{ 
            margin: 0, 
            color: "#63628B", 
            fontSize: 24,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}>
            <span style={{ color: "#56629A" }}>
              <ClipboardCheckIcon />
            </span>
            Moja rešenja
          </h2>
          <p style={{ margin: "6px 0 0", color: "#8B7762", fontSize: 14 }}>
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
                border: "1px solid rgba(86,98,154,0.1)",
                borderRadius: 16,
                background: "#FFFFFF",
                boxShadow: "0 2px 8px rgba(99,98,139,0.06)",
              }}
            >
              {/* Filter */}
              <div style={{ 
                marginBottom: 20, 
                paddingBottom: 16,
                borderBottom: "2px solid #F3F2FB",
                display: "flex", 
                gap: 12,
                alignItems: "center",
              }}>
                <span style={{ fontWeight: 600, color: "#63628B", fontSize: 14, marginRight: 8 }}>
                  Filtriraj:
                </span>
                {(["all", "graded", "pending"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 10,
                      border: filter === f ? "none" : "1px solid rgba(86,98,154,0.15)",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: 13,
                      color: filter === f ? "#fff" : "#63628B",
                      background: filter === f
                        ? "linear-gradient(135deg, #56629A, #63628B)"
                        : "#FFFFFF",
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
                  color: "#8B7762",
                  padding: 40,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                }}>
                  <HourglassIcon />
                  Učitavanje...
                </div>
              ) : (
                <div style={{ display: "grid", gap: 14 }}>
                  {filtered.map((s) => (
                    <div
                      key={s.id}
                      style={{
                        padding: 18,
                        border: "1px solid rgba(86,98,154,0.1)",
                        borderRadius: 12,
                        background: s.grade ? "#f0fdf4" : "#F3F2FB",
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
                              color: "#63628B",
                              marginBottom: 6,
                            }}
                          >
                            {s.taskTitle}
                          </div>
                          <div
                            style={{
                              fontSize: 13,
                              color: "#8B7762",
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <ClockIcon />
                            Predato: {new Date(s.submittedAt).toLocaleString('sr-RS', {
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
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          {s.grade ? (
                            <>
                              <CheckCircleIcon />
                              Ocenjeno
                            </>
                          ) : (
                            <>
                              <HourglassIcon />
                              Na čekanju
                            </>
                          )}
                        </div>
                      </div>

                      {/* File path */}
                      <div
                        style={{
                          fontSize: 14,
                          color: "rgba(99,98,139,0.8)",
                          marginBottom: s.grade ? 12 : 0,
                          padding: 10,
                          background: "#FFFFFF",
                          borderRadius: 8,
                          border: "1px solid rgba(86,98,154,0.1)",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <FileTextIcon />
                        Fajl:{" "}
                        <code
                          style={{
                            background: "#F3F2FB",
                            padding: "3px 8px",
                            borderRadius: 6,
                            fontWeight: 600,
                            color: "#63628B",
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
                            background: "#FFFFFF",
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
                                  <MessageCircleIcon />
                                  Komentar profesora
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
                                  <div style={{ fontSize: 10, color: "#8B7762", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>
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
                        color: "#8B7762",
                        fontStyle: "italic",
                        background: "#F3F2FB",
                        borderRadius: 12,
                        border: "1px solid rgba(86,98,154,0.1)",
                      }}
                    >
                      <div style={{ marginBottom: 12, color: "#56629A" }}>
                        <InboxIcon />
                      </div>
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
                border: "1px solid rgba(86,98,154,0.1)",
                borderRadius: 16,
                background: "linear-gradient(135deg, #FFFFFF 0%, #F3F2FB 100%)",
                boxShadow: "0 2px 8px rgba(99,98,139,0.06)",
              }}
            >
              <h3 style={{ 
                margin: "0 0 16px", 
                color: "#63628B", 
                fontSize: 17,
                paddingBottom: 14,
                borderBottom: "2px solid #F3F2FB",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}>
                <span style={{ color: "#56629A" }}>
                  <BarChartIcon />
                </span>
                Statistika
              </h3>
              
              <div style={{ display: "grid", gap: 12 }}>
                <div style={{ 
                  padding: 14,
                  borderRadius: 10,
                  background: "#FFFFFF",
                  border: "1px solid rgba(86,98,154,0.1)",
                }}>
                  <div style={{ fontSize: 12, color: "#8B7762", marginBottom: 6, fontWeight: 600 }}>
                    Ukupno rešenja
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: "#63628B" }}>
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
                  border: "1px solid rgba(86,98,154,0.1)",
                  borderRadius: 16,
                  background: "#FFFFFF",
                  boxShadow: "0 2px 8px rgba(99,98,139,0.06)",
                }}
              >
                <h3 style={{ 
                  margin: "0 0 16px", 
                  color: "#63628B", 
                  fontSize: 17,
                  paddingBottom: 14,
                  borderBottom: "2px solid #F3F2FB",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}>
                  <span style={{ color: "#56629A" }}>
                    <TrendingUpIcon />
                  </span>
                  Napredak
                </h3>
                
                <div style={{ marginBottom: 16 }}>
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}>
                    <span style={{ fontSize: 13, color: "#8B7762", fontWeight: 600 }}>
                      Ocenjeno zadataka
                    </span>
                    <span style={{ fontSize: 13, color: "#065f46", fontWeight: 700 }}>
                      {gradedSubmissions.length}/{submissions.length}
                    </span>
                  </div>
                  <div style={{
                    height: 10,
                    background: "#F3F2FB",
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
                  background: "#F3F2FB",
                  fontSize: 13,
                  color: "#8B7762",
                  lineHeight: 1.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}>
                  <LightbulbIcon />
                  <div>
                    <strong>Savet:</strong> Nastavite predavati zadatke i pratite svoj napredak!
                  </div>
                </div>
              </div>
            )}

            {/* Raspodela ocena */}
            {gradedSubmissions.length > 0 && (
              <div
                style={{
                  padding: 20,
                  border: "1px solid rgba(86,98,154,0.1)",
                  borderRadius: 16,
                  background: "#FFFFFF",
                  boxShadow: "0 2px 8px rgba(99,98,139,0.06)",
                }}
              >
                <h3 style={{ 
                  margin: "0 0 16px", 
                  color: "#63628B", 
                  fontSize: 17,
                  paddingBottom: 14,
                  borderBottom: "2px solid #F3F2FB",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}>
                  <span style={{ color: "#56629A" }}>
                    <TargetIcon />
                  </span>
                  Raspodela ocena
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
                          color: "#63628B",
                          minWidth: 30,
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}>
                          {grade}
                          <span style={{ color: "#f59e0b" }}>
                            <StarIcon />
                          </span>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            height: 8,
                            background: "#F3F2FB",
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
                          color: "#8B7762",
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