export type Task = {
  id: number;
  courseId: number;
  courseName: string;
  title: string;
  description: string;
  deadline: string;
  createdAt: string;
};

export type TaskSubmission = {
  id: number;
  taskId: number;
  taskTitle: string;
  studentId: number;
  studentName: string;
  filePath: string;
  grade: number | null;
  comment: string | null;
  submittedAt: string;
  gradedAt: string | null;
};