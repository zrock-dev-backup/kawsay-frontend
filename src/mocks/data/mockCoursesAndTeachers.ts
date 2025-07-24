import type { Course } from "../../interfaces/apiDataTypes";
import type { TeacherDto } from "../../interfaces/teacherDtos";
import { getMockTimetables } from "./mockTimetables";

const defaultTimetable = getMockTimetables()[0];

const getDayId = (dayName: string) =>
  defaultTimetable.days.find((d) => d.name === dayName)?.id ?? -1;

export const getMockCourses = (): Course[] => [
  { id: 1, name: "Advanced Software Engineering", code: "CSE401" },
  { id: 2, name: "Machine Learning Fundamentals", code: "AI201" },
  { id: 3, name: "Database Systems", code: "DB303" },
  { id: 4, name: "Operating Systems", code: "CS350" },
];

export const getMockTeachers = (): TeacherDto[] => [
  {
    id: 1,
    fullName: "Dr. Evelyn Reed",
    email: "evelyn.reed@university.edu",
    employmentType: "Full-Time Professor",
    qualifications: [mockCourses[0], mockCourses[1]],
    isActive: true,
    // Dr. Reed is unavailable on Fridays.
    availabilityConstraints: [
      {
        level: "Hard",
        slots: defaultTimetable.periods.map((p) => ({
          dayId: getDayId("Friday"),
          periodId: p.id,
        })),
      },
    ],
  },
  {
    id: 2,
    fullName: "Dr. Samuel Carter",
    email: "samuel.carter@university.edu",
    employmentType: "Full-Time Professor",
    qualifications: [mockCourses[3]],
    isActive: true,
    // Dr. Carter prefers not to teach on Mondays before 11:00 AM.
    // Based on mockTimetables.ts, this affects periods with start times 09:00 and 10:00.
    availabilityConstraints: [
      {
        level: "Soft",
        slots: [
          { dayId: getDayId("Monday"), periodId: 1 }, // 09:00
          { dayId: getDayId("Monday"), periodId: 2 }, // 10:00
        ],
      },
    ],
  },
  {
    id: 3,
    fullName: "Ms. Isabella Chen",
    email: "isabella.chen@practitioners.com",
    employmentType: "Adjunct Practitioner",
    qualifications: [mockCourses[2]],
    isActive: true,
  },
  {
    id: 4,
    fullName: "Mr. Omar Khan",
    email: "omar.khan@practitioners.com",
    employmentType: "Adjunct Practitioner",
    qualifications: [mockCourses[0], mockCourses[2], mockCourses[3]],
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

const mockCourses = getMockCourses();
