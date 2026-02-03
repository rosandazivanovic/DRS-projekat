import React from "react";

export default function TopStats({ total = 0, pending = 0, lastCreated }: { total?: number; pending?: number; lastCreated?: string | null }) {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={card}>
        <div style={{ color: "var(--muted)", fontSize: 13 }}>Ukupno zahteva</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text)" }}>{total}</div>
      </div>

      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ color: "var(--muted)", fontSize: 13 }}>Na čekanju</div>
          <div style={{ fontWeight: 700, color: "var(--text)" }}>{pending}</div>
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: "var(--muted)" }}>
          Poslednji: {lastCreated ? new Date(lastCreated).toLocaleString("sr-RS") : "—"}
        </div>
      </div>
    </div>
  );
}

const card: React.CSSProperties = { background: "white", padding: 12, borderRadius: 12, boxShadow: "0 8px 20px rgba(39,35,30,0.04)", border: "1px solid rgba(44,43,40,0.03)" };
