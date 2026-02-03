import React from "react";
import type { CourseRequest } from "../types/courses";

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
      <div style={{ display: "flex", gap: 12 }}>
        <div style={avatar}>{initials(req.professorName)}</div>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div style={{ fontWeight: 700, color: "var(--text)", fontSize: 16 }}>{req.name}</div>
              <div style={{ fontSize: 13, color: "var(--muted)" }}>{req.professorName}</div>
            </div>

            <div style={statusTag}>NA ČEKANJU</div>
          </div>

          <p style={{ marginTop: 10, color: "rgba(44,43,40,0.75)" }}>{req.description?.slice(0, 240)}{req.description && req.description.length > 240 ? "…" : ""}</p>

          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <button onClick={() => onPreview(req)} style={ghostBtn}>Pregled</button>
            <button onClick={() => onApprove(req.id)} style={approveBtn}>Odobri</button>
            <button onClick={() => onStartReject(req.id)} style={rejectBtn}>Odbij</button>
            {isRejecting && <span style={{ color: "var(--muted)", fontSize: 13 }}>Unos razloga…</span>}
          </div>
        </div>
      </div>
    </article>
  );
}

const card: React.CSSProperties = { background: "white", padding: 14, borderRadius: 12, boxShadow: "0 8px 20px rgba(39,35,30,0.04)", border: "1px solid rgba(44,43,40,0.03)" };
const avatar: React.CSSProperties = { width: 56, height: 56, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#f4efe8,#efe6dd)", fontWeight: 700 };
const statusTag: React.CSSProperties = { fontSize: 12, padding: "6px 10px", borderRadius: 999, background: "#fff7e8", color: "#7a5b32", border: "1px solid rgba(246,227,198,0.6)" };
const ghostBtn: React.CSSProperties = { padding: "8px 12px", borderRadius: 10, border: "1px solid rgba(44,43,40,0.06)", background: "transparent" };
const approveBtn: React.CSSProperties = { padding: "8px 12px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#a2d9b0,#87c88f)", color: "#fff", fontWeight: 600 };
const rejectBtn: React.CSSProperties = { padding: "8px 12px", borderRadius: 10, border: "1px solid rgba(220,38,38,0.08)", background: "#fff5f5", color: "#7a2a2a" };

function initials(name?: string) {
  if (!name) return "";
  return name.split(" ").map(n => n[0]).slice(0,2).join("").toUpperCase();
}
