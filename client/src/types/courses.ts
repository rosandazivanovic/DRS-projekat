export type CourseStatus = "PENDING" | "APPROVED" | "ACTIVE" | "CLOSED" | "REJECTED";

export type Course = {
  id: number;
  professorId: number;
  professorName: string;
  name: string;
  description: string;
  materialPath?: string | null;
  createdAt: string;
  status: CourseStatus;
  rejectionReason?: string | null;
};
