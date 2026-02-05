import type { Course } from "../types/courses";
import { useAuth } from "../auth/AuthContext";

type Props = {
  course: Course;
  onEnroll?: (id: number) => void;
  isEnrolling?: boolean;
  isEnrolled?: boolean;
};

export function CourseCard({ course, onEnroll, isEnrolling, isEnrolled = false }: Props) {
  const { user, hasRole } = useAuth();

  const canEnroll = user && hasRole(["STUDENT"]);

  return (
    <div
      style={{
        ...card,
        background: isEnrolled ? "#f0fdf4" : "#fff",
        border: isEnrolled 
          ? "2px solid rgba(6,95,70,0.15)" 
          : "1px solid rgba(44,43,40,0.06)",
      }}
    >
      <div style={cardContent}>
        <div style={{ flex: 1 }}>
          <div style={titleRow}>
            <div style={title}>
              {course.name}
            </div>
            {isEnrolled && (
              <div style={enrolledBadge}>
                ✓ Upisan
              </div>
            )}
          </div>
          
          <div style={professor}>
            👨‍🏫 {course.professorName}
          </div>
          
          <div style={description}>
            {course.description}
          </div>
        </div>

        <div style={metadata}>
          <div style={metadataLabel}>
            Kreiran
          </div>
          <div style={metadataValue}>
            {new Date(course.createdAt).toLocaleDateString("sr-RS")}
          </div>
        </div>
      </div>

      {canEnroll && (
        <div style={actionsRow}>
          <button
            disabled={isEnrolling || isEnrolled}
            onClick={() => !isEnrolled && onEnroll?.(course.id)}
            style={{
              ...enrollButton,
              cursor: isEnrolling || isEnrolled ? "not-allowed" : "pointer",
              opacity: isEnrolled ? 0.8 : isEnrolling ? 0.7 : 1,
              color: isEnrolled ? "#065f46" : "#fff",
              background: isEnrolled
                ? "#dcfce7"
                : isEnrolling
                ? "linear-gradient(135deg, #d6bca3, #b99a7f)"
                : "linear-gradient(135deg, #d6bca3, #b99a7f)",
              boxShadow: isEnrolling || isEnrolled
                ? "none"
                : "0 4px 12px rgba(121,86,61,0.15)",
            }}
          >
            {isEnrolled ? "✓ Upisani" : isEnrolling ? "Obrada..." : "Upiši se"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ----------------- Styles ----------------- */
const card: React.CSSProperties = {
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 2px 8px rgba(39,35,30,0.04)",
  transition: "all 0.2s",
};

const cardContent: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 20,
  alignItems: "flex-start",
};

const titleRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  marginBottom: 8,
  flexWrap: "wrap",
};

const title: React.CSSProperties = {
  fontWeight: 700,
  fontSize: 17,
  color: "#2c2b28",
};

const enrolledBadge: React.CSSProperties = {
  padding: "4px 12px",
  borderRadius: 20,
  fontSize: 11,
  fontWeight: 600,
  background: "#dcfce7",
  color: "#065f46",
  border: "1px solid rgba(6,95,70,0.12)",
};

const professor: React.CSSProperties = {
  color: "#8b7762",
  fontSize: 13,
  marginBottom: 12,
  display: "flex",
  alignItems: "center",
  gap: 6,
};

const description: React.CSSProperties = {
  color: "rgba(44,43,40,0.75)",
  fontSize: 14,
  lineHeight: 1.6,
};

const metadata: React.CSSProperties = {
  textAlign: "right",
  minWidth: 100,
};

const metadataLabel: React.CSSProperties = {
  fontSize: 11,
  color: "#8b7762",
  marginBottom: 4,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const metadataValue: React.CSSProperties = {
  fontSize: 13,
  color: "#2c2b28",
  fontWeight: 600,
};

const actionsRow: React.CSSProperties = {
  display: "flex",
  gap: 10,
  justifyContent: "flex-end",
  marginTop: 16,
  paddingTop: 16,
  borderTop: "1px solid rgba(44,43,40,0.06)",
};

const enrollButton: React.CSSProperties = {
  padding: "10px 20px",
  borderRadius: 10,
  border: "none",
  fontWeight: 600,
  fontSize: 14,
  transition: "all 0.2s",
};