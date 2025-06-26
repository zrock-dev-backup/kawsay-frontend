import type { Course, Teacher } from "../../interfaces/apiDataTypes";

export const getMockCourses = (): Course[] => [
  { id: 1, name: "Advanced Software Engineering", code: "CSE401" },
  { id: 2, name: "Machine Learning Fundamentals", code: "AI201" },
  { id: 3, name: "Database Systems", code: "DB303" },
  { id: 4, name: "Operating Systems", code: "CS350" },
];

export const getMockTeachers = (): Teacher[] => [
  { id: 1, name: "Dr. Evelyn Reed", type: "Professor" },
  { id: 2, name: "Dr. Samuel Carter", type: "Professor" },
  { id: 3, name: "Ms. Isabella Chen", type: "Faculty Practitioner" },
  { id: 4, name: "Mr. Omar Khan", type: "Faculty Practitioner" },
  { id: 5, name: "Prof. Alan Turing", type: "Professor" },
];
