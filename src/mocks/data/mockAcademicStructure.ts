import type { CohortDetailDto } from "../../interfaces/academicStructureDtos";
import { getMockStudents } from "./mockStudents";

const students = getMockStudents();

// Distribute students into sections to make the academic structure look populated
export const getMockCohorts = (): CohortDetailDto[] => {
  const first40 = students.slice(0, 40);

  const groupASections = [
    { id: 1001, name: "Lab Section A1", students: first40.slice(0, 15) },
    { id: 1002, name: "Lab Section A2", students: first40.slice(15, 28) },
  ];

  const groupBSections = [
    { id: 1003, name: "Lab Section B1", students: first40.slice(28, 40) },
  ];

  return [
    {
      id: 1,
      name: "Fall 2025 Intake",
      timetableId: 1,
      studentGroups: [
        { id: 101, name: "Fall 2025 - Group A", sections: groupASections },
        { id: 102, name: "Fall 2025 - Group B", sections: groupBSections },
      ],
    },
    {
      id: 2,
      name: "Spring 2026 Intake",
      timetableId: 2,
      studentGroups: [
        {
          id: 201,
          name: "Spring 2026 - Group A",
          sections: [
            { id: 2001, name: "Lab Section S1", students: students.slice(40, 60) },
          ],
        },
      ],
    },
  ];
};
