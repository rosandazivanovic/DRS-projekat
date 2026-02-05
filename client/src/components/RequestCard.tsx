import React from "react";
import type { CourseRequest } from "../types/courses";

const UserIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const EyeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const XCircleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/>
    <line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);

export default function RequestCard({
  req,
  onApprove,
  onStartReject,
  onPreview,
  isRejecting,
}: {
  req: CourseRequest;
  onApprove: (id: number) => void;
  onStartReject: (id: number) => void;
  onPreview: (req: CourseRequest) => void;
  isRejecting?: boolean;
}) {
  return (
    <article style={card}>
      <div style={{ display: "flex", gap: 14 }}>
        <div style={avatar}>{initials(req.professorName)}</div>

        <div style={{ flex: 1 }}>
          <div style={headerRow}>
            <div>
              <div style={courseName}>{req.name}</div>
              <div style={professorName}>
                <UserIcon />
                {req.professorName}
              </div>
            </div>

            <div style={statusTag}>
              <ClockIcon />
              NA ČEKANJU
            </div>
          </div>

          <p style={description}>
            {req.description?.slice(0, 240)}
            {req.description && req.description.length > 240 ? "…" : ""}
          </p>

          <div style={actionsRow}>
            <button onClick={() => onPreview(req)} style={ghostBtn}>
              <EyeIcon />
              Pregled
            </button>
            <button onClick={() => onApprove(req.id)} style={approveBtn}>
              <CheckCircleIcon />
              Odobri
            </button>
            <button onClick={() => onStartReject(req.id)} style={rejectBtn}>
              <XCircleIcon />
              Odbij
            </button>
            {isRejecting && (
              <span style={processingText}>Unos razloga…</span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function initials(name?: string) {
  if (!name) return "";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/* ----------------- Styles ----------------- */
const card: React.CSSProperties = {
  background: "#FFFFFF",
  padding: 18,
  borderRadius: 14,
  boxShadow: "0 2px 8px rgba(99,98,139,0.06)",
  border: "1px solid rgba(86,98,154,0.1)",
  transition: "all 0.2s",
};

const avatar: React.CSSProperties = {
  width: 56,
  height: 56,
  borderRadius: 12,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, #E8E7F5, #D9D8EB)",
  fontWeight: 700,
  fontSize: 16,
  color: "#63628B",
};

const headerRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 16,
  marginBottom: 10,
};

const courseName: React.CSSProperties = {
  fontWeight: 700,
  color: "#63628B",
  fontSize: 17,
  marginBottom: 4,
};

const professorName: React.CSSProperties = {
  fontSize: 13,
  color: "#8B7762",
  display: "flex",
  alignItems: "center",
  gap: 4,
};

const statusTag: React.CSSProperties = {
  fontSize: 12,
  padding: "6px 12px",
  borderRadius: 20,
  background: "#FBF7F2",
  color: "#9A7556",
  border: "1px solid rgba(154,117,86,0.2)",
  fontWeight: 600,
  whiteSpace: "nowrap",
  display: "flex",
  alignItems: "center",
  gap: 4,
};

const description: React.CSSProperties = {
  marginTop: 12,
  color: "rgba(99,98,139,0.75)",
  fontSize: 14,
  lineHeight: 1.6,
};

const actionsRow: React.CSSProperties = {
  marginTop: 14,
  display: "flex",
  gap: 8,
  alignItems: "center",
  flexWrap: "wrap",
};

const ghostBtn: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: 10,
  border: "1px solid rgba(86,98,154,0.15)",
  background: "#FFFFFF",
  fontSize: 13,
  fontWeight: 600,
  color: "#63628B",
  cursor: "pointer",
  transition: "all 0.2s",
  display: "flex",
  alignItems: "center",
  gap: 6,
};

const approveBtn: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: 10,
  border: "none",
  background: "linear-gradient(135deg, #a2d9b0, #87c88f)",
  color: "#FFFFFF",
  fontWeight: 600,
  fontSize: 13,
  cursor: "pointer",
  boxShadow: "0 2px 8px rgba(135,200,143,0.2)",
  transition: "all 0.2s",
  display: "flex",
  alignItems: "center",
  gap: 6,
};

const rejectBtn: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: 10,
  border: "1px solid rgba(220,38,38,0.12)",
  background: "#fff5f5",
  color: "#991b1b",
  fontWeight: 600,
  fontSize: 13,
  cursor: "pointer",
  transition: "all 0.2s",
  display: "flex",
  alignItems: "center",
  gap: 6,
};

const processingText: React.CSSProperties = {
  color: "#8B7762",
  fontSize: 13,
  fontStyle: "italic",
};