
export default function SkeletonCard() {
  return (
    <div style={{ background: "#fff", padding: 14, borderRadius: 12, boxShadow: "0 8px 20px rgba(39,35,30,0.03)" }}>
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ width: 56, height: 56, borderRadius: 12, background: "#eee" }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 14, width: "40%", background: "#eee", marginBottom: 8 }} />
          <div style={{ height: 12, width: "30%", background: "#f3f3f3", marginBottom: 12 }} />
          <div style={{ height: 44, width: "100%", background: "#f7f7f7" }} />
        </div>
      </div>
    </div>
  );
}
