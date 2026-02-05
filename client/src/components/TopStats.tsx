import React from "react";

const FileTextIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

export default function TopStats({ total = 0, pending = 0, lastCreated }: { total?: number; pending?: number; lastCreated?: string | null }) {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={card}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: 8, 
          marginBottom: 8,
          color: "#56629A",
        }}>
          <FileTextIcon />
          <div style={{ fontSize: 13, fontWeight: 600 }}>Ukupno zahteva</div>
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#63628B" }}>{total}</div>
      </div>

      <div style={card}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          marginBottom: 8,
        }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 8,
            color: "#56629A",
          }}>
            <ClockIcon />
            <div style={{ fontSize: 13, fontWeight: 600 }}>Na čekanju</div>
          </div>
          <div style={{ fontWeight: 700, color: "#63628B" }}>{pending}</div>
        </div>
        <div style={{ fontSize: 12, color: "#8B7762" }}>
          Poslednji: {lastCreated ? new Date(lastCreated).toLocaleString("sr-RS") : "—"}
        </div>
      </div>
    </div>
  );
}

const card: React.CSSProperties = { 
  background: "#FFFFFF", 
  padding: 12, 
  borderRadius: 12, 
  boxShadow: "0 8px 20px rgba(99,98,139,0.06)", 
  border: "1px solid rgba(86,98,154,0.08)" 
};