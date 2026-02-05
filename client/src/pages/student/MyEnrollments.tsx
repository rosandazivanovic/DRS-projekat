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
    <div style={pageWrap}>
      <div style={container}>
        <div style={header}>
          <h2 style={{ margin: 0, color: "#2c2b28", fontSize: 26, fontWeight: 700 }}>
            📋 Moji upisi
          </h2>
          <p style={{ margin: "6px 0 0", color: "#8b7762", fontSize: 15 }}>
            Pregled svih zahteva za upis na kurseve
          </p>
        </div>

        <div style={{ display: "grid", gap: 14 }}>
          {items.map((p) => (
            <div key={p.id} style={enrollmentCard}>
              <div style={cardHeader}>
                <div style={courseIdBadge}>
                  Kurs #{p.courseId}
                </div>
                <div style={getStatusBadge(p.status)}>
                  {p.status}
                </div>
              </div>
              <div style={dateInfo}>
                🕐 {new Date(p.createdAt).toLocaleString("sr-RS")}
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div style={emptyState}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
              Još nema upisa.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ----------------- Helpers ----------------- */
const getStatusBadge = (status: string): React.CSSProperties => {
  const baseStyle: React.CSSProperties = {
    padding: "6px 14px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: "nowrap",
  };

  if (status === "APPROVED") {
    return {
      ...baseStyle,
      background: "#dcfce7",
      color: "#065f46",
      border: "1px solid rgba(6,95,70,0.12)",
    };
  } else if (status === "REJECTED") {
    return {
      ...baseStyle,
      background: "#fff5f5",
      color: "#991b1b",
      border: "1px solid rgba(220,38,38,0.12)",
    };
  } else {
    return {
      ...baseStyle,
      background: "#fff7e8",
      color: "#7a5b32",
      border: "1px solid rgba(122,91,50,0.12)",
    };
  }
};

/* ----------------- Styles ----------------- */
const pageWrap: React.CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(180deg,#fbf7f2 0%,#f6f1ea 100%)",
  padding: 24,
};

const container: React.CSSProperties = {
  maxWidth: 900,
  margin: "0 auto",
  background: "#fff",
  borderRadius: 20,
  padding: 28,
  boxShadow: "0 20px 40px rgba(39,35,30,0.04)",
};

const header: React.CSSProperties = {
  marginBottom: 24,
  paddingBottom: 20,
  borderBottom: "2px solid #f5f0ea",
};

const enrollmentCard: React.CSSProperties = {
  border: "1px solid rgba(44,43,40,0.06)",
  borderRadius: 14,
  padding: 18,
  background: "#fffaf6",
  boxShadow: "0 2px 8px rgba(39,35,30,0.04)",
  transition: "all 0.2s",
};

const cardHeader: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 10,
};

const courseIdBadge: React.CSSProperties = {
  fontWeight: 700,
  color: "#2c2b28",
  fontSize: 16,
};

const dateInfo: React.CSSProperties = {
  color: "#8b7762",
  fontSize: 13,
  display: "flex",
  alignItems: "center",
  gap: 6,
};

const emptyState: React.CSSProperties = {
  textAlign: "center",
  padding: 60,
  color: "#8b7762",
  fontStyle: "italic",
  background: "#fffaf6",
  borderRadius: 16,
  boxShadow: "0 2px 8px rgba(39,35,30,0.04)",
};