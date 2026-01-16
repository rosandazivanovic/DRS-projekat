import type { Course } from "../types/courses";
import { mockCourses as initial } from "./db";

let courses: Course[] = [...initial];
let listeners: Array<() =>  void>= [];

export function getCourses(): Course[] {
  return courses;
}

export function setCourses(next: Course[]) {
  courses = next;
  listeners.forEach((l) => l());
}

export function addCourse(c: Course) {
  courses = [c, ...courses];
  listeners.forEach((l) => l());
}

export function subscribeCourses(listener: () => void): () => void {
  listeners.push(listener);
  return () => { 
    listeners =listeners.filter((l)=> l!==listener);
  };
}
