import type { TimetableStructure } from "../../interfaces/timetableDtos";

export const getMockTimetables = (): TimetableStructure[] => [
  {
    id: 1,
    name: "Fall 2025 Semester (Draft)",
    status: "Draft",
    startDate: "2025-09-01",
    endDate: "2025-12-15",
    days: [
      { id: 1, name: "Monday" },
      { id: 2, name: "Wednesday" },
      { id: 3, name: "Friday" },
    ],
    periods: [
      { id: 1, start: "09:00", end: "10:00" },
      { id: 2, start: "10:00", end: "11:00" },
    ],
  },
  {
    id: 2,
    name: "Spring 2026 Semester (Published)",
    status: "Published",
    startDate: "2026-01-15",
    endDate: "2026-05-10",
    days: [
      { id: 1, name: "Tuesday" },
      { id: 2, name: "Thursday" },
    ],
    periods: [{ id: 1, start: "10:00", end: "11:00" }],
  },
];
