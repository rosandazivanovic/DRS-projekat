import { useEffect, useState } from "react";

type Review = {
  id: number;
  courseId: number;
  userEmail: string;
  rating: number;
  createdAt: string;
  comment?: string;
};

const mockReviews: Review[] = [
  {
    id: 1,
    courseId: 1,
    userEmail: "ana@example.com",
    rating: 5,
    createdAt: new Date().toISOString(),
    comment: "Odličan kurs!",
  },
  {
    id: 2,
    courseId: 2,
    userEmail: "marko@example.com",
    rating: 4,
    createdAt: new Date().toISOString(),
  },
];

export default function AdminReviewsPage() {
  const [items, setItems] = useState<Review[]>([]);

  useEffect(() => {
    setItems(mockReviews);
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
            ⭐ Ocene i komentari
          </h2>
          <p style={{ margin: "6px 0 0", color: "#666" }}>
            Povratne informacije studenata o kursevima
          </p>
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          {items.map((r) => (
            <div
              key={r.id}
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
                  Kurs #{r.courseId}
                </div>

                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    padding: "4px 10px",
                    borderRadius: 999,
                    background: "#fff",
                    border: "1px solid #ddd",
                    color: "#333",
                  }}
                >
                  ⭐ {r.rating}/5
                </div>
              </div>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 13,
                  color: "#667eea",
                }}
              >
                {r.userEmail}
              </div>

              {r.comment && (
                <div
                  style={{
                    marginTop: 10,
                    padding: 12,
                    borderRadius: 12,
                    background: "#fff",
                    border: "1px solid #eee",
                    color: "#444",
                    fontStyle: "italic",
                  }}
                >
                  “{r.comment}”
                </div>
              )}

              <div
                style={{
                  marginTop: 10,
                  fontSize: 12,
                  color: "#777",
                  textAlign: "right",
                }}
              >
                {new Date(r.createdAt).toLocaleString()}
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
              Nema ocena još.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
