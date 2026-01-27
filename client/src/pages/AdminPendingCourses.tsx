import { useEffect, useState } from "react";
import { http } from "../api/https";
import { endpoints } from "../api/endpoints";
import type { CourseRequest } from "../types/courses";

export default function AdminPendingCourses() {
  const [requests, setRequests] = useState<CourseRequest[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await http.get(endpoints.admin.courseRequests);
      setRequests(res.data.filter((r: CourseRequest) => r.status === "PENDING"));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const approve = async (id: number) => {
    try {
      await http.post(endpoints.admin.approveRequest(id));
      alert("Zahtev za kurs odobren ✅");
      fetchRequests();
    } catch (err: any) {
      alert(err?.response?.data?.error ?? "Greška pri odobravanju.");
    }
  };

  const reject = async (id: number) => {
    const reason = prompt("Razlog odbijanja:");
    if (!reason) return;

    try {
      await http.post(endpoints.admin.rejectRequest(id), { reason });
      alert("Zahtev za kurs odbijen ❌");
      fetchRequests();
    } catch (err: any) {
      alert(err?.response?.data?.error ?? "Greška pri odbijanju.");
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
          background: "#fffaf6",
          borderRadius: 20,
          padding: 28,
          boxShadow: "0 20px 40px rgba(39,35,30,0.04)",
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ margin: 0, color: "#2c2b28" }}>📋 Zahtevi za kurseve</h2>
          <p style={{ margin: "6px 0 0", color: "#8b7762" }}>
            Administratorski pregled novih kurseva
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", color: "#8b7762" }}>Učitavanje...</div>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {requests.map((c) => (
              <div
                key={c.id}
                style={{
                  border: "1px solid rgba(44,43,40,0.06)",
                  borderRadius: 16,
                  padding: 18,
                  background: "#fff",
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
                    <div style={{ color: "#8b7762", fontSize: 13 }}>
                      {c.professorName}
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      padding: "4px 10px",
                      borderRadius: 999,
                      background: "#fff7e8",
                      color: "#7a5b32",
                      border: "1px solid rgba(246,227,198,0.6)",
                    }}
                  >
                    NA ČEKANJU
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 12,
                    color: "rgba(44,43,40,0.75)",
                    fontSize: 14,
                    lineHeight: 1.5,
                  }}
                >
                  {c.description}
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    marginTop: 16,
                  }}
                >
                  <button
                    onClick={() => approve(c.id)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 10,
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 600,
                      color: "#fff",
                      background: "linear-gradient(135deg,#a2d9b0,#87c88f)",
                      boxShadow: "0 6px 18px rgba(10,80,50,0.08)",
                    }}
                  >
                    Odobri
                  </button>

                  <button
                    onClick={() => reject(c.id)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 10,
                      border: "1px solid rgba(180,130,130,0.12)",
                      cursor: "pointer",
                      fontWeight: 600,
                      color: "#7a2a2a",
                      background: "#fff5f5",
                    }}
                  >
                    Odbij
                  </button>
                </div>
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
        )}
      </div>
    </div>
  );
}
