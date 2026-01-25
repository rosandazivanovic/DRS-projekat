export type Role = "STUDENT" | "PROFESOR" | "ADMIN";

export type User = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  profileImage?: string;
  birthDate?: string;
  gender?: string;
  country?: string;
  street?: string;
  number?: string;
};