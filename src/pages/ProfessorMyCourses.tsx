import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { Course } from "../types/courses";
import { getCourses, subscribeCourses } from "../mocks/courseStore";

export default function ProfessorMyCoursesPage() {
  const { user, hasRole } = useAuth();
  const nav = useNavigate();
  const [items, setItems] = useState<Course[]>([]);

  useEffect(() => {
    if (!user) return;

    const sync = () => {
      const all = getCourses();
      const mine = all.filter(
        (c) =>
          c.professorId === user?.id &&
          ["PENDING", "REJECTED", "ACTIVE"].includes(c.status)
      );
      setItems(mine);
    };

    sync();

    const unsubscribe = subscribeCourses(sync);
    return unsubscribe;
  }, [user?.id]);

  if (!user || !hasRole(["PROFESOR"])) {
    return <div style={{ padding: 16 }}>Nemaš pristup ovoj stranici.</div>;
  }

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
            📚 Moji kursevi
          </h2>
          <p style={{ margin: "6px 0 0", color: "#666" }}>
            Upravljanje i status tvojih kurseva
          </p>
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          {items.map((c) => (
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
                  <div
                    style={{
                      marginTop: 4,
                      color: "#666",
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
                      c.status === "ACTIVE"
                        ? "#e6fffa"
                        : c.status === "PENDING"
                        ? "#fff3cd"
                        : "#f8d7da",
                    color:
                      c.status === "ACTIVE"
                        ? "#065f46"
                        : c.status === "PENDING"
                        ? "#856404"
                        : "#721c24",
                    border: "1px solid #eee",
                  }}
                >
                  {c.status}
                </div>
              </div>

              {c.status === "REJECTED" && c.rejectionReason && (
                <div
                  style={{
                    marginTop: 10,
                    padding: 10,
                    borderRadius: 10,
                    background: "#fff",
                    border: "1px solid #f5c6cb",
                    color: "#721c24",
                    fontSize: 13,
                  }}
                >
                  <b>Razlog odbijanja:</b> {c.rejectionReason}
                </div>
              )}

              {c.status === "REJECTED" && (
                <div style={{ marginTop: 14 }}>
                  <button
                    onClick={() =>
                      nav(`/professor/courses/${c.id}/edit`)
                    }
                    style={{
                      padding: "8px 14px",
                      borderRadius: 10,
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 600,
                      color: "#fff",
                      background:
                        "linear-gradient(135deg, #667eea, #764ba2)",
                    }}
                  >
                    Izmeni i pošalji ponovo
                  </button>
                </div>
              )}
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
              Nema kurseva.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
