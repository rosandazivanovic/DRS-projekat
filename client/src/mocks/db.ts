import type { Course } from "../types/courses";

export const mockProfessors = [
  { id: 1, name: "Prof. Marko Marković" },
  { id: 2, name: "Prof. Jelena Janković" },
  { id: 3, name: "Prof. Ana Petrović" },
];

export const mockCourses: Course[] = [
  {
    id: 1,
    professorId: 3,
    professorName: "Prof. Ana Petrović",
    name: "Osnove programiranja",
    description: "Uvod u Python i osnovne koncepte programiranja.",
    materialPath: null,
    createdAt: new Date().toISOString(),
    status: "ACTIVE",
  },
  {
    id: 2,
    professorId: 2,
    professorName: "Prof. Jelena Janković",
    name: "Baze podataka",
    description: "Relacione baze, SQL i ORM tehnike.",
    materialPath: null,
    createdAt: new Date().toISOString(),
    status: "ACTIVE",
  },
  {
    id: 3,
    professorId: 1,
    professorName: "Prof. Marko Marković",
    name: "Računarske mreže",
    description: "Osnove mreža, modeli i praktične vežbe.",
    materialPath: null,
    createdAt: new Date().toISOString(),
    status: "PENDING",
  },
];
