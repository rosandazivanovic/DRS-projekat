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
  background: "#fff",
  padding: 18,
  borderRadius: 14,
  boxShadow: "0 2px 8px rgba(39,35,30,0.03)",
  border: "1px solid rgba(44,43,40,0.04)",
};

const avatarSkeleton: React.CSSProperties = {
  width: 56,
  height: 56,
  borderRadius: 12,
  background: "linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.5s infinite",
};

const titleSkeleton: React.CSSProperties = {
  height: 16,
  width: "40%",
  background: "linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%)",
  backgroundSize: "200% 100%",
  borderRadius: 4,
  marginBottom: 10,
  animation: "shimmer 1.5s infinite",
};

const subtitleSkeleton: React.CSSProperties = {
  height: 12,
  width: "30%",
  background: "linear-gradient(90deg, #f5f5f5 25%, #fafafa 50%, #f5f5f5 75%)",
  backgroundSize: "200% 100%",
  borderRadius: 4,
  marginBottom: 14,
  animation: "shimmer 1.5s infinite 0.1s",
};

const textSkeleton: React.CSSProperties = {
  height: 44,
  width: "100%",
  background: "linear-gradient(90deg, #fafafa 25%, #fcfcfc 50%, #fafafa 75%)",
  backgroundSize: "200% 100%",
  borderRadius: 8,
  animation: "shimmer 1.5s infinite 0.2s",
};