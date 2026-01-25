export type Enrollment = {
  id: number;
  courseId: number;
  studentId?: number;
  createdAt: string;
  status: "ENROLLED" | "CANCELLED";
};

let enrollments: Enrollment[] = [];
let nextId = 1;

export function getMyEnrollments(): Promise<Enrollment[]> {
  return Promise.resolve([...enrollments].sort((a, b) => b.id - a.id));
}

export async function createEnrollment(courseId: number): Promise<Enrollment> {
  const p: Enrollment = {
    id: nextId++,
    courseId,
    studentId: undefined,
    createdAt: new Date().toISOString(),
    status: "ENROLLED",
  };
  enrollments = [p, ...enrollments];

  // simulate processing
  await new Promise((r) => setTimeout(r, 1200));

  return p;
}

export async function cancelEnrollment(id: number): Promise<void> {
  enrollments = enrollments.map((e) => (e.id === id ? { ...e, status: "CANCELLED" } : e));
  return Promise.resolve();
}
