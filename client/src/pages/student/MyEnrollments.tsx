import { useEffect, useState } from "react";
import { getMyEnrollments } from "../../mocks/enrollments";

export default function MyEnrollmentsPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const refresh = () => getMyEnrollments().then(setItems);
    refresh();
    const id = setInterval(refresh, 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <h2 style={{ color: "#2c2b28" }}>Moji upisi</h2>
      <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
        {items.map((p) => (
          <div key={p.id} style={{ border: "1px solid rgba(44,43,40,0.06)", borderRadius: 14, padding: 14, background: "#fffaf6" }}>
            <div style={{ fontWeight: 700, color: "#2c2b28" }}>Kurs #{p.courseId}</div>
            <div style={{ color: "rgba(44,43,40,0.8)" }}>Status: <b>{p.status}</b></div>
            <div style={{ color: "#8b7762", fontSize: 12 }}>{new Date(p.createdAt).toLocaleString()}</div>
          </div>
        ))}
        {items.length === 0 && <div style={{ marginTop: 16 }}>Još nema upisa.</div>}
      </div>
    </div>
  );
}
