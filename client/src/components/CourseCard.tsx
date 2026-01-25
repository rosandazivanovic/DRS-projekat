import type { Course } from "../types/courses";
import { useAuth } from "../auth/AuthContext";

type Props = {
  course: Course;
  onEnroll?: (id: number) => void;
  isEnrolling?: boolean;
};

export function CourseCard({ course, onEnroll, isEnrolling }: Props) {
  const { user, hasRole } = useAuth();

  const canEnroll = user && hasRole(["STUDENT"]);

  return (
    <div
      style={{
        border: "1px solid rgba(44,43,40,0.06)",
        borderRadius: 16,
        padding: 18,
        background: "#fffaf6",
        boxShadow: "0 8px 20px rgba(39,35,30,0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "flex-start",
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: 16,
              color: "#2c2b28",
            }}
          >
            {course.name}
          </div>
          <div style={{ color: "#8b7762", fontSize: 13, marginTop: 4 }}>
            {course.professorName}
          </div>
          <div
            style={{
              color: "rgba(44,43,40,0.75)",
              marginTop: 8,
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            {course.description}
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, color: "#8b7762" }}>
            {new Date(course.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {canEnroll && (
        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "flex-end",
            marginTop: 14,
          }}
        >
          <button
            disabled={isEnrolling}
            onClick={() => onEnroll?.(course.id)}
            style={{
              padding: "8px 16px",
              borderRadius: 10,
              border: "none",
              cursor: isEnrolling ? "not-allowed" : "pointer",
              opacity: isEnrolling ? 0.6 : 1,
              fontWeight: 600,
              color: "#fff",
              background: isEnrolling
                ? "linear-gradient(135deg, #d6bca3, #b99a7f)"
                : "linear-gradient(135deg, #d6bca3, #b99a7f)",
              boxShadow: isEnrolling ? "none" : "0 6px 18px rgba(121,86,61,0.12)",
            }}
          >
            {isEnrolling ? "Obrada..." : "Upiši se"}
          </button>
        </div>
      )}
    </div>
  );
}
