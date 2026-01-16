import type { Course } from "../types/courses";
import { useAuth } from "../auth/AuthContext";

type Props = {
  course: Course;
  onEnroll?: (id: number) => void;
  onCancelEnrollment?: (id: number) => void;
  isEnrolling?: boolean;
};

export function CourseCard({ course, onEnroll, onCancelEnrollment, isEnrolling }: Props) {
  const { user, hasRole } = useAuth();

  const canEnroll = user && hasRole(["STUDENT"]) && course.status === "ACTIVE";
  const canManage = user && hasRole(["PROFESOR"]) && course.professorId === user.id;

  return (
    <div style={{ border: "1px solid #eee", borderRadius: 14, padding: 14, display: "grid", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <div>
          <div style={{ fontWeight: 700 }}>{course.name}</div>
          <div style={{ color: "#555" }}>{course.professorName}</div>
          <div style={{ color: "#777", marginTop: 6 }}>{course.description}</div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 700 }}>{course.status}</div>
          <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>{course.createdAt}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        {canEnroll && (
          <button
            disabled={isEnrolling}
            onClick={() => onEnroll?.(course.id)}
            style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #ddd", cursor: isEnrolling ? "not-allowed" : "pointer", opacity: isEnrolling ? 0.6 : 1 }}
          >
            {isEnrolling ? "Obrada..." : "Upiši se"}
          </button>
        )}

        {canManage && (
          <button
            onClick={() => onCancelEnrollment?.(course.id)}
            style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #ddd", cursor: "pointer", color: "crimson" }}
          >
            Poništi kurs
          </button>
        )}
      </div>
    </div>
  );
}
