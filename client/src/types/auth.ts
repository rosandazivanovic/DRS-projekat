export type Role = "STUDENT" | "PROFESOR" | "ADMIN";

export type User = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  balance?: number;
  profileImage?: string;
};
