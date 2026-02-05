import { useEffect, useState } from "react";

export default function RejectModal({ 
  open, 
  onClose, 
  onConfirm, 
  defaultReason = "" 
}: { 
  open: boolean; 
  onClose: () => void; 
  onConfirm: (reason: string) => void; 
  defaultReason?: string;
}) {
  const [reason, setReason] = useState(defaultReason);
  
  useEffect(() => {
    setReason(defaultReason);
  }, [defaultReason, open]);

  const templates = [
    "Nedovoljno opisan kurs – dodajte detalje o strukturi.",
    "Nedostaje materijal za učenje/priručnik.",
    "Ciljevi kursa nisu jasno definisani.",
  ];

  if (!open) return null;

  return (
    <div 
      style={overlay} 
      role="dialog" 
      aria-modal="true" 
      aria-label="Odbij kurs"
      onClick={onClose}
    >
      <div 
        style={modal}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={modalHeader}>
          <h3 style={modalTitle}>Odbij kurs</h3>
          <button 
            onClick={onClose}
            style={closeButton}
            aria-label="Zatvori"
          >
            ✕
          </button>
        </div>

        <div style={modalBody}>
          <div style={sectionTitle}>Izaberi šablon ili napiši svoj razlog:</div>
          
          <div style={templatesContainer}>
            {templates.map((t) => (
              <button 
                key={t} 
                onClick={() => setReason(t)} 
                style={{
                  ...templateButton,
                  background: reason === t ? "#f5f0ea" : "#fff",
                  border: reason === t 
                    ? "2px solid rgba(185,154,127,0.3)" 
                    : "1px solid rgba(44,43,40,0.1)",
                }}
              >
                {truncate(t, 80)}
              </button>
            ))}
          </div>

          <textarea 
            value={reason} 
            onChange={(e) => setReason(e.target.value)} 
            placeholder="Unesite razlog..."
            style={textareaStyle}
          />
        </div>

        <div style={modalFooter}>
          <button onClick={onClose} style={cancelButton}>
            Otkaži
          </button>
          <button onClick={() => onConfirm(reason)} style={confirmButton}>
            Potvrdi odbijanje
          </button>
        </div>
      </div>
    </div>
  );
}

function truncate(s: string, n: number) {
  if (!s) return "";
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

/* ----------------- Styles ----------------- */
const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 999,
  padding: 24,
};

const modal: React.CSSProperties = {
  width: "100%",
  maxWidth: 720,
  background: "#fff",
  padding: 24,
  borderRadius: 16,
  boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
};

const modalHeader: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: 20,
  paddingBottom: 16,
  borderBottom: "2px solid #f5f0ea",
};

const modalTitle: React.CSSProperties = {
  margin: 0,
  color: "#2c2b28",
  fontSize: 22,
  fontWeight: 700,
};

const closeButton: React.CSSProperties = {
  background: "none",
  border: "none",
  fontSize: 24,
  color: "#8b7762",
  cursor: "pointer",
  padding: 4,
  lineHeight: 1,
  transition: "color 0.2s",
};

const modalBody: React.CSSProperties = {
  marginBottom: 20,
};

const sectionTitle: React.CSSProperties = {
  fontSize: 13,
  color: "#8b7762",
  fontWeight: 600,
  marginBottom: 12,
};

const templatesContainer: React.CSSProperties = {
  display: "flex",
  gap: 8,
  marginBottom: 16,
  flexWrap: "wrap",
};

const templateButton: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 10,
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 500,
  color: "#2c2b28",
  transition: "all 0.2s",
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 100,
  padding: 12,
  borderRadius: 10,
  border: "1px solid rgba(44,43,40,0.1)",
  fontSize: 14,
  color: "#2c2b28",
  fontFamily: "inherit",
  resize: "vertical",
  boxShadow: "inset 0 1px 0 rgba(0,0,0,0.02)",
};

const modalFooter: React.CSSProperties = {
  display: "flex",
  gap: 10,
  justifyContent: "flex-end",
  paddingTop: 16,
  borderTop: "1px solid rgba(44,43,40,0.06)",
};

const cancelButton: React.CSSProperties = {
  padding: "10px 20px",
  borderRadius: 10,
  border: "1px solid rgba(44,43,40,0.12)",
  background: "#fff",
  fontWeight: 600,
  fontSize: 14,
  color: "#2c2b28",
  cursor: "pointer",
  transition: "all 0.2s",
};

const confirmButton: React.CSSProperties = {
  padding: "10px 20px",
  borderRadius: 10,
  border: "none",
  background: "linear-gradient(135deg,#d6bca3,#b99a7f)",
  color: "#fff",
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
  boxShadow: "0 4px 12px rgba(121,86,61,0.15)",
  transition: "all 0.2s",
};