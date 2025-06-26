import type { CourseRequirementDto } from "../../interfaces/courseRequirementDtos";
import type { RequirementIssueDto } from "../../interfaces/auditDtos";
import dayjs from "dayjs";

export const getMockRequirements = (): CourseRequirementDto[] => [
  {
    id: 1,
    timetableId: 1,
    courseId: 1,
    courseName: "Advanced Software Engineering",
    studentGroupId: 101,
    studentGroupName: "Fall 2025 - Group A",
    classType: "Masterclass",
    length: 2,
    frequency: 2,
    priority: "High",
    requiredTeacherId: null,
    startDate: dayjs().add(1, "week").format("YYYY-MM-DD"),
    endDate: dayjs().add(9, "week").format("YYYY-MM-DD"),
    schedulingPreferences: [{ dayId: 1, startPeriodId: 2 }],
    eligibilitySummary: null,
  },
  {
    id: 2,
    timetableId: 1,
    courseId: 2,
    courseName: "Machine Learning Fundamentals",
    studentGroupId: 101,
    studentGroupName: "Fall 2025 - Group A",
    classType: "Masterclass",
    length: 2,
    frequency: 1,
    priority: "Medium",
    requiredTeacherId: 5,
    startDate: "2025-09-01",
    endDate: "2025-12-15",
    schedulingPreferences: [],
    eligibilitySummary: { eligible: 47, total: 50, issues: 3 },
  },
];

export const getMockRequirementIssues = (): Record<
  string,
  RequirementIssueDto[]
> => ({
  "2": [
    {
      studentId: 1002,
      studentName: "Peter Jones",
      issueType: "Prerequisite",
      details: "Missing prerequisite: MATH101 - Calculus I",
    },
    {
      studentId: 1025,
      studentName: "Emily White",
      issueType: "AdminHold",
      details: "Financial hold on account.",
    },
  ],
});
