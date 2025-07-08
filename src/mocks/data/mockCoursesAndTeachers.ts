import type { Course } from "../../interfaces/apiDataTypes";
import type { TeacherDto } from "../../interfaces/teacherDtos";

export const getMockCourses = (): Course[] => [
  { id: 1, name: "Advanced Software Engineering", code: "CSE401" },
  { id: 2, name: "Machine Learning Fundamentals", code: "AI201" },
  { id: 3, name: "Database Systems", code: "DB303" },
  { id: 4, name: "Operating Systems", code: "CS350" },
];

const mockCourses = getMockCourses();

export const getMockTeachers = (): TeacherDto[] => [
  {
    id: 1,
    fullName: "Dr. Evelyn Reed",
    email: "evelyn.reed@university.edu",
    employmentType: "Full-Time Professor",
    qualifications: [mockCourses[0], mockCourses[1]], // Qualified for CSE401 and AI201
    isActive: true,
  },
  {
    id: 2,
    fullName: "Dr. Samuel Carter",
    email: "samuel.carter@university.edu",
    employmentType: "Full-Time Professor",
    qualifications: [mockCourses[3]], // Qualified for CS350
    isActive: true,
  },
  {
    id: 3,
    fullName: "Ms. Isabella Chen",
    email: "isabella.chen@practitioners.com",
    employmentType: "Adjunct Practitioner",
    qualifications: [mockCourses[2]], // Qualified for DB303
    isActive: true,
  },
  {
    id: 4,
    fullName: "Mr. Omar Khan",
    email: "omar.khan@practitioners.com",
    employmentType: "Adjunct Practitioner",
    qualifications: [mockCourses[0], mockCourses[2], mockCourses[3]], // Broad qualifications
    isActive: true,
  },
  {
    id: 5,
    fullName: "Prof. Alan Turing",
    email: "alan.turing@university.edu",
    employmentType: "Full-Time Professor",
    qualifications: [],
    isActive: false,
  },
];
