import type { GradeSyncReportDto } from "../../interfaces/eomDtos.ts";

const mockEomReports: Record<number, GradeSyncReportDto> = {
  101: {
    processedCount: 180,
    failedCount: 3,
    syncedAt: new Date().toISOString(),
    source: "mock-lms",
    errors: [
      { csvRow: 12, studentId: 50012, error: "Missing final grade" },
      { csvRow: 89, studentId: 50089, error: "Course not found" },
      { csvRow: 144, studentId: 50144, error: "Duplicate record" },
    ],
    retakeDemand: [
      { courseCode: "DB303", studentCount: 14 },
      { courseCode: "PHY101", studentCount: 9 },
      { courseCode: "UX210", studentCount: 4 },
    ],
    advancingCohorts: [
      { cohortName: "Fall 2024 - Group A", studentCount: 46 },
      { cohortName: "Fall 2024 - Group B", studentCount: 43 },
      { cohortName: "Fall 2024 - Group C", studentCount: 38 },
    ],
  },
  202: {
    processedCount: 132,
    failedCount: 1,
    syncedAt: new Date().toISOString(),
    source: "mock-lms",
    errors: [{ csvRow: 35, studentId: 64035, error: "Invalid grade format" }],
    retakeDemand: [
      { courseCode: "CS102", studentCount: 11 },
      { courseCode: "CAL201", studentCount: 5 },
    ],
    advancingCohorts: [
      { cohortName: "Spring 2025 - Group A", studentCount: 40 },
      { cohortName: "Spring 2025 - Group B", studentCount: 37 },
    ],
  },
};

export const getMockEomReports = (): Record<number, GradeSyncReportDto> =>
  JSON.parse(JSON.stringify(mockEomReports)) as Record<
    number,
    GradeSyncReportDto
  >;

