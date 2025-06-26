import type { Class } from "../../interfaces/classDtos";

export const getMockClasses = (): Class[] => [
  {
    id: 1,
    timetableId: 1, // Belongs to the "Draft" timetable
    length: 2,
    frequency: 2,
    classType: "Masterclass",
    startDate: "2025-09-08T00:00:00.000Z",
    endDate: "2025-11-03T00:00:00.000Z",
    courseId: 1,
    courseName: "Advanced Software Engineering",
    courseCode: "CSE401",
    teacherId: 1,
    teacherName: "Dr. Evelyn Reed",
    classOccurrences: [],
    periodPreferences: [{ dayId: 1, startPeriodId: 2 }],
  },
];
