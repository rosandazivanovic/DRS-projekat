import { useEffect, useState } from "react";
import { getMyEnrollments } from "../../mocks/enrollments";

const ClipboardIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const InboxIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
  </svg>
);

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
          <h2 style={{ 
            margin: 0, 
            color: "#63628B", 
            fontSize: 26, 
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}>
            <span style={{ color: "#56629A" }}>
              <ClipboardIcon />
            </span>
            Moji upisi
          </h2>
          <p style={{ margin: "6px 0 0", color: "#8B7762", fontSize: 15 }}>
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
                <ClockIcon />
                {new Date(p.createdAt).toLocaleString("sr-RS")}
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div style={emptyState}>
              <div style={{ marginBottom: 12, color: "#56629A" }}>
                <InboxIcon />
              </div>
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
      background: "#FBF7F2",
      color: "#9A7556",
      border: "1px solid rgba(154,117,86,0.15)",
    };
  }
};

/* ----------------- Styles ----------------- */
const pageWrap: React.CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #F3F2FB 0%, #FBF7F2 100%)",
  padding: 24,
};

const container: React.CSSProperties = {
  maxWidth: 900,
  margin: "0 auto",
  background: "#FFFFFF",
  borderRadius: 20,
  padding: 28,
  boxShadow: "0 20px 40px rgba(99,98,139,0.08)",
};

const header: React.CSSProperties = {
  marginBottom: 24,
  paddingBottom: 20,
  borderBottom: "2px solid #F3F2FB",
};

const enrollmentCard: React.CSSProperties = {
  border: "1px solid rgba(86,98,154,0.1)",
  borderRadius: 14,
  padding: 18,
  background: "#F3F2FB",
  boxShadow: "0 2px 8px rgba(99,98,139,0.06)",
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
  color: "#63628B",
  fontSize: 16,
};

const dateInfo: React.CSSProperties = {
  color: "#8B7762",
  fontSize: 13,
  display: "flex",
  alignItems: "center",
  gap: 6,
};

const emptyState: React.CSSProperties = {
  textAlign: "center",
  padding: 60,
  color: "#8B7762",
  fontStyle: "italic",
  background: "#F3F2FB",
  borderRadius: 16,
  boxShadow: "0 2px 8px rgba(99,98,139,0.06)",
};