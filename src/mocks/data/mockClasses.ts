import type { AvailableClassDto } from "../../interfaces/classDtos";

export const getMockAvailableClasses = (): AvailableClassDto[] => [
  {
    id: 101,
    courseId: 1,
    teacherId: 1,
    courseCode: "CSE401",
    courseName: "Advanced Software Engineering",
    teacherName: "Dr. Smith",
    capacity: 30,
    currentEnrollment: 25,
    isEligible: true,
    isRetake: false,
    ineligibilityReason: null,
    length: 2,
    frequency: 2,
    classType: "Masterclass",
    startDate: null,
    endDate: null,
    timetableId: 1,
    classOccurrences: [],
    periodPreferences: [],
  },
];
