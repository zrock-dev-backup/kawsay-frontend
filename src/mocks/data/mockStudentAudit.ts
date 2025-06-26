import type { StudentAuditDto } from "../../interfaces/auditDtos";

export const getMockStudentAudit = (): StudentAuditDto[] => [
  {
    studentId: 1001,
    studentName: "Jane Doe",
    studentGroupName: "Group A",
    status: "ReadyToEnroll",
    lastUpdated: "2023-10-25T11:00:00Z",
  },
  {
    studentId: 1002,
    studentName: "Peter Jones",
    studentGroupName: "Group A",
    status: "ActionRequired",
    issues: [
      "Financial Hold: Outstanding balance of $500.",
      "Missing Prerequisite: MATH101",
    ],
    lastUpdated: "2023-10-24T09:30:00Z",
  },
  {
    studentId: 1003,
    studentName: "John Smith",
    studentGroupName: "Group B",
    status: "Enrolled",
    lastUpdated: "2023-10-20T15:00:00Z",
  },
  {
    studentId: 1004,
    studentName: "Emily White",
    studentGroupName: "Group A",
    status: "ReadyToEnroll",
    lastUpdated: "2023-10-25T11:05:00Z",
  },
  {
    studentId: 1005,
    studentName: "David Green",
    studentGroupName: "Group B",
    status: "ActionRequired",
    issues: ["Admin Hold: Must meet with academic advisor."],
    lastUpdated: "2023-10-23T14:00:00Z",
  },
  {
    studentId: 1006,
    studentName: "Sarah Connor",
    studentGroupName: "Group C",
    status: "ReadyToEnroll",
    lastUpdated: "2023-10-25T12:00:00Z",
  },
];
