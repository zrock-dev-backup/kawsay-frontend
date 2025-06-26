import type { StudentDto } from "../../interfaces/studentDtos";
import type { ProposedEnrollmentDto } from "../../interfaces/studentDtos";

export const getMockStudents = (): StudentDto[] => [
  {
    id: 1,
    name: "Jane Doe",
    currentCourseLoad: 1,
    standing: "GoodStanding",
    proposedEnrollmentCount: 2,
  },
  {
    id: 2,
    name: "John Smith",
    currentCourseLoad: 3,
    standing: "GoodStanding",
    proposedEnrollmentCount: 0,
  },
  {
    id: 3,
    name: "Peter Jones",
    currentCourseLoad: 2,
    standing: "AcademicProbation",
    proposedEnrollmentCount: 1,
  },
  {
    id: 4,
    name: "Mary Williams",
    currentCourseLoad: 0,
    standing: "GoodStanding",
    proposedEnrollmentCount: 3,
  },
];

export const getMockProposedEnrollments = (): Record<
  string,
  ProposedEnrollmentDto[]
> => ({
  "1": [
    {
      classId: 101,
      courseCode: "CSE401",
      courseName: "Advanced Software Engineering",
      teacherName: "Dr. Smith",
      reason: "Core curriculum requirement.",
    },
    {
      classId: 102,
      courseCode: "AI201",
      courseName: "Machine Learning Fundamentals",
      teacherName: "Prof. Jones",
      reason: "Next course in AI track.",
    },
  ],
  "3": [
    {
      classId: 105,
      courseCode: "DB303-R",
      courseName: "Database Systems (Retake)",
      teacherName: "Dr. Davis",
      reason: "Required retake for failed module.",
    },
  ],
});
