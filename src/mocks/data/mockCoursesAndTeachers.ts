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
  { id: 5, name: "Computer Networks", code: "CN220" },
  { id: 6, name: "Software Testing and QA", code: "ST305" },
  { id: 7, name: "Human-Computer Interaction", code: "UX210" },
  { id: 8, name: "Probability and Statistics", code: "MTH201" },
  { id: 9, name: "Linear Algebra", code: "MTH202" },
  { id: 10, name: "Introduction to AI", code: "AI101" },
  { id: 11, name: "Web Technologies", code: "WEB110" },
  { id: 12, name: "Cloud Computing", code: "CLOUD300" },
];

export const getMockTeachers = (): TeacherDto[] => {
  const mockCourses = getMockCourses();

  return [
    {
      id: 1,
      fullName: "Dr. Evelyn Reed",
      email: "evelyn.reed@university.edu",
      employmentType: "Full-Time Professor",
      qualifications: [mockCourses[0], mockCourses[1]],
      isActive: true,
      // Dr. Reed is unavailable on Fridays (hard constraint)
      defaultAvailabilityConstraints: [
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
      qualifications: [mockCourses[3], mockCourses[4]],
      isActive: true,
      // Prefers not to teach early on Mondays (soft)
      defaultAvailabilityConstraints: [
        {
          level: "Soft",
          slots: [
            { dayId: getDayId("Monday"), periodId: 1 },
            { dayId: getDayId("Monday"), periodId: 2 },
          ],
        },
      ],
    },
    {
      id: 3,
      fullName: "Ms. Isabella Chen",
      email: "isabella.chen@practitioners.com",
      employmentType: "Adjunct Practitioner",
      qualifications: [mockCourses[2], mockCourses[6]],
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
      qualifications: [mockCourses[9], mockCourses[1]],
      isActive: false,
    },
    {
      id: 6,
      fullName: "Dr. Maria Gonzalez",
      email: "m.gonzalez@university.edu",
      employmentType: "Full-Time Professor",
      qualifications: [mockCourses[5], mockCourses[0]],
      isActive: true,
      timetableOverrides: [
        {
          timetableId: 1,
          constraints: [
            {
              level: "Hard",
              slots: [{ dayId: getDayId("Wednesday"), periodId: 2 }],
            },
          ],
        },
      ],
    },
    {
      id: 7,
      fullName: "Dr. Chen Li",
      email: "chen.li@university.edu",
      employmentType: "Lecturer",
      qualifications: [mockCourses[7], mockCourses[8]],
      isActive: true,
    },
    {
      id: 8,
      fullName: "Prof. Grace Hopper",
      email: "grace.hopper@university.edu",
      employmentType: "Full-Time Professor",
      qualifications: [mockCourses[10], mockCourses[11]],
      isActive: true,
    },
    {
      id: 9,
      fullName: "Mr. Diego Ramirez",
      email: "d.ramirez@practitioners.com",
      employmentType: "Adjunct Practitioner",
      qualifications: [mockCourses[4], mockCourses[5]],
      isActive: true,
    },
    {
      id: 10,
      fullName: "Dr. Priya Kapoor",
      email: "priya.kapoor@university.edu",
      employmentType: "Full-Time Professor",
      qualifications: [mockCourses[1], mockCourses[9]],
      isActive: true,
    },
    {
      id: 11,
      fullName: "Ms. Ana Silva",
      email: "ana.silva@practitioners.com",
      employmentType: "Adjunct Practitioner",
      qualifications: [mockCourses[6], mockCourses[10]],
      isActive: true,
    },
    {
      id: 12,
      fullName: "Dr. Robert King",
      email: "r.king@university.edu",
      employmentType: "Lecturer",
      qualifications: [mockCourses[3], mockCourses[2]],
      isActive: true,
    },
  ];
};
