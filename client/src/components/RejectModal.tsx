
import { useEffect,  useState } from "react";
// ---------------------- RejectModal (exported) ----------------------
export default function RejectModal({ open, onClose, onConfirm, defaultReason = "" }: { open: boolean; onClose: () => void; onConfirm: (reason: string) => void; defaultReason?: string }) {
  const [reason, setReason] = useState(defaultReason);
  useEffect(() => setReason(defaultReason), [defaultReason, open]);

  const templates = [
    "Nedovoljno opisan kurs — dodajte detalje o strukturi.",
    "Nedostaje materijal za učenje/priručnik.",
    "Ciljevi kursa nisu jasno definisani.",
  ];

  if (!open) return null;
  return (
    <div style={overlay} role="dialog" aria-modal="true" aria-label="Odbij kurs">
      <div style={modal}>
        <h3 style={{ marginTop: 0 }}>Odbij kurs</h3>
        <div style={{ marginBottom: 8, color: "var(--muted)" }}>Izaberi šablon ili napiši svoj razlog:</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
          {templates.map((t) => (
            <button key={t} onClick={() => setReason(t)} style={{ padding: "6px 8px", borderRadius: 8, border: "1px solid rgba(44,43,40,0.06)", background: reason === t ? "var(--card-bg)" : "white" }}>{truncate(t, 80)}</button>
          ))}
        </div>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Unesite razlog..." style={{ width: "100%", minHeight: 100, padding: 10, borderRadius: 8 }} />
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
          <button onClick={onClose} style={{ padding: "8px 12px", borderRadius: 8 }}>Otkaži</button>
          <button onClick={() => onConfirm(reason)} style={{ padding: "8px 12px", borderRadius: 8, background: "linear-gradient(135deg,#d6bca3,#b99a7f)", color: "#fff" }}>Potvrdi odbijanje</button>
        </div>
      </div>
    </div>
  );
}

function truncate(s: string, n: number) {
  if (!s) return "";
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

const overlay: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 };
const modal: React.CSSProperties = { width: 720, background: "var(--glass)", padding: 18, borderRadius: 12, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" };
