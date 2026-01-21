import type { Course } from "../types/courses";
import { getCourses } from "./courseStore";
import { mockProfessors } from "./db";

type ListParams = {
  search?: string;
  professorId?: string;
  status?: Course["status"];
};

export function listProfessors() {
  return Promise.resolve(mockProfessors);
}

export function listCourses(params: ListParams = {}) {
  let items: Course[] = [...getCourses()];

  if (params.status) items = items.filter((c) => c.status === params.status);
  if (params.professorId) items = items.filter((c) => String(c.professorId) === String(params.professorId));
  if (params.search) {
    const s = params.search.toLowerCase().trim();
    items = items.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        c.professorName.toLowerCase().includes(s) ||
        c.description.toLowerCase().includes(s)
    );
  }

  return new Promise<Course[]>((resolve) => setTimeout(() => resolve(items), 200));
}
