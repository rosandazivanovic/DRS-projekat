export type CourseStatus = "PENDING" | "APPROVED" | "REJECTED";

export type CourseRequest = {
  id: number;
  professorId: number;
  professorName: string;
  name: string;
  description: string;
  status: CourseStatus;
  rejectionReason?: string; 
  createdAt: string;
};

export type Course = {
  id: number;
  professorId: number;
  professorName: string;
  name: string;
  description: string;
  materialPath?: string | null;
  createdAt: string;
  status?: string; 
};

export type CourseEnrollment = {
  id: number;
  courseId: number;
  courseName: string;
  studentId: number;
  studentName: string;
  enrolledAt: string;
  status?: string;
};