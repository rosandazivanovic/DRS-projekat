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
        border: "1px solid rgba(44,43,40,0.06)",
        borderRadius: 16,
        padding: 20,
        background: isEnrolled ? "#f0fdf4" : "#fff",
        boxShadow: "0 2px 8px rgba(39,35,30,0.04)",
        transition: "all 0.2s",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          alignItems: "flex-start",
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 6,
            }}
          >
            <div
              style={{
                fontWeight: 700,
                fontSize: 17,
                color: "#2c2b28",
              }}
            >
              {course.name}
            </div>
            {isEnrolled && (
              <div
                style={{
                  padding: "4px 10px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 600,
                  background: "#dcfce7",
                  color: "#065f46",
                  border: "1px solid rgba(6,95,70,0.12)",
                }}
              >
                ✓ Upisan
              </div>
            )}
          </div>
          <div
            style={{
              color: "#8b7762",
              fontSize: 13,
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            👨‍🏫 {course.professorName}
          </div>
          <div
            style={{
              color: "rgba(44,43,40,0.75)",
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            {course.description}
          </div>
        </div>

        <div style={{ textAlign: "right", minWidth: 100 }}>
          <div
            style={{
              fontSize: 11,
              color: "#8b7762",
              marginBottom: 4,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Kreiran
          </div>
          <div style={{ fontSize: 13, color: "#2c2b28", fontWeight: 600 }}>
            {new Date(course.createdAt).toLocaleDateString("sr-RS")}
          </div>
        </div>
      </div>

      {canEnroll && (
        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "flex-end",
            marginTop: 16,
            paddingTop: 16,
            borderTop: "1px solid rgba(44,43,40,0.06)",
          }}
        >
          <button
            disabled={isEnrolling || isEnrolled}
            onClick={() => !isEnrolled && onEnroll?.(course.id)}
            style={{
              padding: "10px 20px",
              borderRadius: 10,
              border: "none",
              cursor: isEnrolling || isEnrolled ? "not-allowed" : "pointer",
              opacity: isEnrolled ? 0.7 : isEnrolling ? 0.6 : 1,
              fontWeight: 600,
              fontSize: 14,
              color: isEnrolled ? "#065f46" : "#fff",
              background: isEnrolled
                ? "#dcfce7"
                : isEnrolling
                ? "linear-gradient(135deg, #d6bca3, #b99a7f)"
                : "linear-gradient(135deg, #d6bca3, #b99a7f)",
              boxShadow:
                isEnrolling || isEnrolled
                  ? "none"
                  : "0 4px 12px rgba(121,86,61,0.15)",
              transition: "all 0.2s",
            }}
          >
            {isEnrolled ? "✓ Upisani" : isEnrolling ? "Obrada..." : "Upiši se"}
          </button>
        </div>
      )}
    </div>
  );
}