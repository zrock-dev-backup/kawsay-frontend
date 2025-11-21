type ExternalSectionSeed = {
  name: string;
  studentIds: number[];
};

type ExternalGroupSeed = {
  name: string;
  sections: ExternalSectionSeed[];
};

type ExternalCohortSeed = {
  name: string;
  groups: ExternalGroupSeed[];
};

const rosterSyncSource: Record<number, ExternalCohortSeed[]> = {
  1: [
    {
      name: "Fall 2025 Intake",
      groups: [
        {
          name: "Fall 2025 - Group A",
          sections: [
            { name: "Lab Section A1", studentIds: [1, 2] },
            { name: "Lab Section A2", studentIds: [3] },
          ],
        },
        {
          name: "Fall 2025 - Group C",
          sections: [{ name: "Studio Section C1", studentIds: [4] }],
        },
      ],
    },
  ],
  2: [
    {
      name: "Spring 2026 Intake",
      groups: [
        {
          name: "Spring 2026 - Group A",
          sections: [{ name: "Lab Section S-A1", studentIds: [2, 3] }],
        },
      ],
    },
  ],
};

export function getRosterSyncSource(
  timetableId: number,
): ExternalCohortSeed[] | null {
  return rosterSyncSource[timetableId] ?? null;
}

