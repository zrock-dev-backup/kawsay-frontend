import type { CohortDetailDto } from "../../interfaces/academicStructureDtos";

export const getMockCohorts = (): CohortDetailDto[] => [
  {
    id: 1,
    name: "Fall 2025 Intake",
    timetableId: 1, // Belongs to the "Draft" timetable
    studentGroups: [
      {
        id: 101,
        name: "Group A",
        sections: [
          {
            id: 1001,
            name: "Section A1",
            students: [],
          },
          {
            id: 1002,
            name: "Section A2",
            students: [],
          },
        ],
      },
      {
        id: 102,
        name: "Group B",
        sections: [],
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
