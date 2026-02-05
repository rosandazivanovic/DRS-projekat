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

const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export default function PreviewModal({ 
  open, 
  req, 
  onClose 
}: { 
  open: boolean; 
  req?: CourseRequest | null; 
  onClose: () => void;
}) {
  if (!open || !req) return null;

  return (
    <div 
      style={overlay} 
      role="dialog" 
      aria-modal="true" 
      aria-label="Pregled kursa"
      onClick={onClose}
    >
      <div 
        style={modal}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={modalHeader}>
          <h3 style={modalTitle}>{req.name}</h3>
          <button 
            onClick={onClose}
            style={closeButton}
            aria-label="Zatvori"
          >
            <XIcon />
          </button>
        </div>

        <div style={modalMeta}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <UserIcon />
            {req.professorName}
          </span>
          <span style={{ color: "#56629A" }}>•</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <ClockIcon />
            {new Date(req.createdAt).toLocaleString("sr-RS")}
          </span>
        </div>

        <div style={modalBody}>
          <div style={sectionTitle}>Opis kursa</div>
          <div style={description}>{req.description}</div>
        </div>

        <div style={modalFooter}>
          <button onClick={onClose} style={actionButton}>
            Zatvori
          </button>
        </div>
      </div>
    </div>
  );
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
  background: "#FFFFFF",
  padding: 24,
  borderRadius: 16,
  boxShadow: "0 20px 40px rgba(99,98,139,0.15)",
};

const modalHeader: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: 12,
  paddingBottom: 16,
  borderBottom: "2px solid #F3F2FB",
};

const modalTitle: React.CSSProperties = {
  margin: 0,
  color: "#63628B",
  fontSize: 22,
  fontWeight: 700,
};

const closeButton: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#8B7762",
  cursor: "pointer",
  padding: 4,
  lineHeight: 1,
  transition: "color 0.2s",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const modalMeta: React.CSSProperties = {
  color: "#8B7762",
  fontSize: 14,
  marginBottom: 20,
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const modalBody: React.CSSProperties = {
  marginBottom: 20,
};

const sectionTitle: React.CSSProperties = {
  fontSize: 13,
  color: "#56629A",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  marginBottom: 10,
};

const description: React.CSSProperties = {
  color: "#63628B",
  fontSize: 14,
  lineHeight: 1.6,
  padding: 16,
  background: "#F3F2FB",
  borderRadius: 10,
  border: "1px solid rgba(86,98,154,0.1)",
};

const modalFooter: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  paddingTop: 16,
  borderTop: "1px solid rgba(86,98,154,0.1)",
};

const actionButton: React.CSSProperties = {
  padding: "10px 20px",
  borderRadius: 10,
  border: "1px solid rgba(86,98,154,0.15)",
  background: "#FFFFFF",
  fontWeight: 600,
  fontSize: 14,
  color: "#63628B",
  cursor: "pointer",
  transition: "all 0.2s",
};