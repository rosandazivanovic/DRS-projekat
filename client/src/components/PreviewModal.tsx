import type { CourseRequest } from "../types/courses";

// ---------------------- PreviewModal ----------------------
export default function PreviewModal({ open, req, onClose }: { open: boolean; req?: CourseRequest | null; onClose: () => void }) {
  if (!open || !req) return null;
  return (
    <div style={overlay} role="dialog" aria-modal="true" aria-label="Pregled kursa">
      <div style={{ ...modal, width: 760 }}>
        <h3 style={{ marginTop: 0 }}>{req.name}</h3>
        <div style={{ color: "var(--muted)" }}>{req.professorName} • {new Date(req.createdAt).toLocaleString("sr-RS")}</div>
        <div style={{ marginTop: 12 }}>{req.description}</div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
          <button onClick={onClose} style={{ padding: 8, borderRadius: 8 }}>Zatvori</button>
        </div>
      </div>
    </div>
  );
}


const overlay: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 };
const modal: React.CSSProperties = { width: 720, background: "var(--glass)", padding: 18, borderRadius: 12, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" };

