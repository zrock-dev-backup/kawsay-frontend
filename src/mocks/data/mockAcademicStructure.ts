import type { CohortDetailDto } from "../../interfaces/academicStructureDtos";

export const getMockCohorts = (): CohortDetailDto[] => [
  {
    id: 1,
    name: "Fall 2025 Intake",
    timetableId: 1, // Belongs to the "Draft" timetable
    studentGroups: [
      {
        id: 101,
        name: "Fall 2025 - Group A",
        sections: [
          {
            id: 1001,
            name: "Lab Section A1",
            students: [],
          },
          {
            id: 1002,
            name: "Lab Section A2",
            students: [],
          },
        ],
      },
      {
        id: 102,
        name: "Fall 2025 - Group B",
        sections: [
          {
            id: 1003,
            name: "Lab Section B1",
            students: [],
          },
        ],
      },
    ],
  },
  {
    id: 2,
    name: "Spring 2026 Intake",
    timetableId: 2, // Belongs to the "Published" timetable
    studentGroups: [],
  },
];
