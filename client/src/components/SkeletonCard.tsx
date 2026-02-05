export default function SkeletonCard() {
  return (
    <div style={card}>
      <div style={{ display: "flex", gap: 14 }}>
        <div style={avatarSkeleton} />
        <div style={{ flex: 1 }}>
          <div style={titleSkeleton} />
          <div style={subtitleSkeleton} />
          <div style={textSkeleton} />
        </div>
      </div>
    </div>
  );
}

/* ----------------- Styles ----------------- */
const card: React.CSSProperties = {
  background: "#FFFFFF",
  padding: 18,
  borderRadius: 14,
  boxShadow: "0 2px 8px rgba(99,98,139,0.04)",
  border: "1px solid rgba(86,98,154,0.08)",
};

const avatarSkeleton: React.CSSProperties = {
  width: 56,
  height: 56,
  borderRadius: 12,
  background: "linear-gradient(90deg, #F3F2FB 25%, #FAFAFA 50%, #F3F2FB 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.5s infinite",
};

const titleSkeleton: React.CSSProperties = {
  height: 16,
  width: "40%",
  background: "linear-gradient(90deg, #F3F2FB 25%, #FAFAFA 50%, #F3F2FB 75%)",
  backgroundSize: "200% 100%",
  borderRadius: 4,
  marginBottom: 10,
  animation: "shimmer 1.5s infinite",
};

const subtitleSkeleton: React.CSSProperties = {
  height: 12,
  width: "30%",
  background: "linear-gradient(90deg, #F5F4FC 25%, #FCFCFC 50%, #F5F4FC 75%)",
  backgroundSize: "200% 100%",
  borderRadius: 4,
  marginBottom: 14,
  animation: "shimmer 1.5s infinite 0.1s",
};

const textSkeleton: React.CSSProperties = {
  height: 44,
  width: "100%",
  background: "linear-gradient(90deg, #FAFAFA 25%, #FCFCFC 50%, #FAFAFA 75%)",
  backgroundSize: "200% 100%",
  borderRadius: 8,
  animation: "shimmer 1.5s infinite 0.2s",
};