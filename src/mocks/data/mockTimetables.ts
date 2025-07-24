import type { TimetableStructure } from "../../interfaces/timetableDtos";

export const MASTER_TIMETABLE_STRUCTURE: TimetableStructure = {
  id: 999, // A special ID
  name: "Master University Week",
  status: "Published",
  startDate: "2000-01-01",
  endDate: "2099-12-31",
  days: [
    { id: 1, name: "Monday" },
    { id: 2, name: "Tuesday" },
    { id: 3, name: "Wednesday" },
    { id: 4, name: "Thursday" },
    { id: 5, name: "Friday" },
  ],
  periods: [
    { id: 1, start: "08:00", end: "09:00" },
    { id: 2, start: "09:00", end: "10:00" },
    { id: 3, start: "10:00", end: "11:00" },
    { id: 4, start: "11:00", end: "12:00" },
    { id: 5, start: "12:00", end: "13:00" },
    { id: 6, start: "13:00", end: "14:00" },
    { id: 7, start: "14:00", end: "15:00" },
    { id: 8, start: "15:00", end: "16:00" },
    { id: 9, start: "16:00", end: "17:00" },
  ],
};

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
