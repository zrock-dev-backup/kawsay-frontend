import type { StudentDto } from "../../interfaces/studentDtos";
import type { ProposedEnrollmentDto } from "../../interfaces/studentDtos";

const NAMES = [
  "Olivia Martin",
  "Liam Johnson",
  "Emma Williams",
  "Noah Brown",
  "Ava Jones",
  "Oliver Garcia",
  "Sophia Martinez",
  "Elijah Rodriguez",
  "Isabella Wilson",
  "Lucas Anderson",
  "Mia Thomas",
  "Mason Taylor",
  "Amelia Lee",
  "Ethan Harris",
  "Harper Clark",
  "Logan Lewis",
  "Evelyn Robinson",
  "James Walker",
  "Charlotte Young",
  "Benjamin Allen",
  "Aria King",
  "Henry Wright",
  "Sofia Scott",
  "Alexander Torres",
  "Ella Nguyen",
  "Daniel Hill",
  "Zoe Flores",
  "Matthew Green",
  "Lily Adams",
  "Jackson Nelson",
  "Grace Baker",
  "Sebastian Hall",
  "Chloe Rivera",
  "Aiden Campbell",
  "Victoria Mitchell",
  "Samuel Carter",
  "Camila Perez",
  "Owen Roberts",
  "Penelope Turner",
  "Wyatt Phillips",
  "Riley Parker",
  "Jack Evans",
  "Nora Edwards",
  "Luke Collins",
  "Hazel Stewart",
  "Gabriel Sanchez",
  "Eleanor Morris",
  "Carter Rogers",
  "Madison Reed",
  "Ivy Bennett",
  "Theo Wallace",
  "Luna Warren",
  "Miles Fox",
  "Sadie Bell",
  "Isaac Bennett",
  "Ruby Coleman",
  "Caleb Hughes",
  "Maya Rice",
  "Leo Bishop",
  "Aurora Shaw",
  "Hudson Grant",
  "Piper Walsh",
];

export const getMockStudents = (): StudentDto[] =>
  NAMES.map((n, i) => ({
    id: i + 1,
    name: n,
    currentCourseLoad: Math.floor(Math.random() * 5),
    standing:
      Math.random() < 0.9
        ? "GoodStanding"
        : Math.random() < 0.5
        ? "AcademicProbation"
        : "Suspended",
    proposedEnrollmentCount: Math.floor(Math.random() * 4),
  }));

// Some students will have proposed enrollments to make lists interesting
export const getMockProposedEnrollments = (): Record<
  string,
  ProposedEnrollmentDto[]
> => {
  const result: Record<string, ProposedEnrollmentDto[]> = {};
  for (let i = 1; i <= NAMES.length; i++) {
    if (i % 7 === 0 || i % 11 === 0) {
      result[String(i)] = [
        {
          classId: 100 + i,
          courseCode: "CSE401",
          courseName: "Advanced Software Engineering",
          teacherName: "Dr. Evelyn Reed",
          reason: "Core requirement",
        },
      ];
    }
  }

  return result;
};
