import { useEffect, useState } from "react";
type Review = { id: number; courseId: number; userEmail: string; rating: number; createdAt: string; comment?: string };

const mockReviews: Review[] = [
  { id: 1, courseId: 1, userEmail: "ana@example.com", rating: 5, createdAt: new Date().toISOString(), comment: "Odličan kurs!" },
  { id: 2, courseId: 2, userEmail: "marko@example.com", rating: 4, createdAt: new Date().toISOString() },
];

export default function AdminReviewsPage() {
  const [items, setItems] = useState<Review[]>([]);

  useEffect(() => {
    setItems(mockReviews);
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <h2 style={{ color: "#2c2b28" }}>Ocene i komentari</h2>

      <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
        {items.map((r) => (
          <div
            key={r.id}
            style={{
              border: "1px solid rgba(44,43,40,0.06)",
              borderRadius: 14,
              padding: 14,
              background: "#fffaf6",
            }}
          >
            <div style={{ fontWeight: 700, color: "#2c2b28" }}>Kurs #{r.courseId}</div>
            <div style={{ color: "rgba(44,43,40,0.8)" }}>{r.userEmail} • Ocena: <b>{r.rating}/5</b></div>
            {r.comment && <div style={{ marginTop: 8 }}>{r.comment}</div>}
            <div style={{ fontSize: 12, color: "#8b7762" }}>{new Date(r.createdAt).toLocaleString()}</div>
          </div>
        ))}
        {items.length === 0 && <div style={{ marginTop: 16 }}>Nema ocena još.</div>}
      </div>
    </div>
  );
}
