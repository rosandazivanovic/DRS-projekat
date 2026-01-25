import { useEffect, useState } from "react";
import { getMyEnrollments } from "../mocks/enrollments";

export default function MyEnrollmentsPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const refresh = () => getMyEnrollments().then(setItems);
    refresh();
    const id = setInterval(refresh, 2000);
    return () => clearInterval(id);
  }, []);

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
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ margin: 0, color: "#2d2d2d" }}>
            📘 Moji upisi
          </h2>
          <p style={{ margin: "6px 0 0", color: "#666" }}>
            Pregled kurseva na koje ste upisani
          </p>
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          {items.map((p) => (
            <div
              key={p.id}
              style={{
                border: "1px solid #eee",
                borderRadius: 16,
                padding: 18,
                background: "#fafafa",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 15,
                    color: "#333",
                  }}
                >
                  Kurs #{p.courseId}
                </div>

                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    padding: "4px 10px",
                    borderRadius: 999,
                    background:
                      p.status === "APPROVED"
                        ? "#e6fffa"
                        : p.status === "PENDING"
                        ? "#fff3cd"
                        : "#f8d7da",
                    color:
                      p.status === "APPROVED"
                        ? "#065f46"
                        : p.status === "PENDING"
                        ? "#856404"
                        : "#721c24",
                    border: "1px solid #eee",
                  }}
                >
                  {p.status}
                </div>
              </div>

              <div
                style={{
                  marginTop: 10,
                  fontSize: 12,
                  color: "#777",
                  textAlign: "right",
                }}
              >
                {new Date(p.createdAt).toLocaleString()}
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: 24,
                color: "#777",
                fontStyle: "italic",
              }}
            >
              Još nema upisa.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
