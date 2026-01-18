import { useState } from "react";
import { mockCourses } from "../mocks/db";
import type { Course } from "../types/courses";

export default function AdminPendingCourses() {
  const [courses, setCourses] = useState<Course[]>(
    mockCourses.filter((c) => c.status === "PENDING")
  );

  const approve = (id: number) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
    alert("Zahtev za kurs odobren ✅ (mock)");
  };

  const reject = (id: number) => {
    const reason = prompt("Razlog odbijanja:");
    if (!reason) return;
    setCourses((prev) => prev.filter((c) => c.id !== id));
    alert("Zahtev za kurs odbijen ❌ (mock)");
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
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ margin: 0, color: "#2d2d2d" }}>
            📋 Zahtevi za kurseve
          </h2>
          <p style={{ margin: "6px 0 0", color: "#666" }}>
            Administratorski pregled novih kurseva
          </p>
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          {courses.map((c) => (
            <div
              key={c.id}
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
                  alignItems: "flex-start",
                  gap: 12,
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 16,
                      color: "#333",
                    }}
                  >
                    {c.name}
                  </div>
                  <div style={{ color: "#667eea", fontSize: 13 }}>
                    {c.professorName}
                  </div>
                </div>

                <div
                  style={{
                    fontSize: 12,
                    padding: "4px 10px",
                    borderRadius: 999,
                    background: "#fff3cd",
                    color: "#856404",
                    border: "1px solid #ffeeba",
                  }}
                >
                  NA ČEKANJU
                </div>
              </div>

              <div
                style={{
                  marginTop: 12,
                  color: "#555",
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
                    background:
                      "linear-gradient(135deg, #4CAF50, #43a047)",
                  }}
                >
                  Odobri
                </button>

                <button
                  onClick={() => reject(c.id)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 10,
                    border: "1px solid #f5c6cb",
                    cursor: "pointer",
                    fontWeight: 600,
                    color: "#721c24",
                    background: "#f8d7da",
                  }}
                >
                  Odbij
                </button>
              </div>
            </div>
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
              Nema zahteva za kurseve.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
