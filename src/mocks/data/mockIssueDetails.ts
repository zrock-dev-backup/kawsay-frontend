import type {
  AdminHoldIssueContext,
  PrerequisiteIssueContext,
  StudentIssueDetailDto,
  TimeClashIssueContext,
} from "../../interfaces/issueDtos.ts";

export const getMockIssueDetails = (): Record<
  string,
  StudentIssueDetailDto[]
> => ({
  // Issues for Peter Jones (studentId: 1002), who has status 'ActionRequired'
  "1002": [
    {
      issueId: "prereq-1002-2",
      issueType: "Prerequisite",
      message:
        "Student is missing required prerequisites for 'Machine Learning Fundamentals'.",
      context: {
        courseId: 2,
        courseName: "Machine Learning Fundamentals",
        missingPrerequisites: [
          { courseId: 101, courseName: "MATH101 - Calculus I" },
          { courseId: 102, courseName: "CS101 - Intro to Programming" },
        ],
      } as PrerequisiteIssueContext,
      availableActions: ["Override"],
    },
  ],
  // Issues for David Green (studentId: 1005), who also has 'ActionRequired'
  "1005": [
    {
      issueId: "hold-1005-advisor",
      issueType: "AdminHold",
      message:
        "Student must meet with their academic advisor before enrolling.",
      context: {
        holdReason: "Mandatory Advising Session Required",
      } as AdminHoldIssueContext,
      availableActions: ["Acknowledge"],
    },
    {
      issueId: "clash-1005-1-3",
      issueType: "TimeClash",
      message:
        "Proposed enrollment for 'Advanced Software Engineering' clashes with 'Database Systems'.",
      context: {
        conflictingClasses: [
          {
            classId: 1,
            courseName: "Advanced Software Engineering",
            scheduleSummary: "Mon 10:00-11:00",
          },
          {
            classId: 3,
            courseName: "Database Systems",
            scheduleSummary: "Mon 10:00-11:00",
          },
        ],
        suggestedAlternatives: [
          {
            classId: 301,
            courseName: "Database Systems",
            scheduleSummary: "Wed 14:00-15:00",
            teacherName: "Dr. Evelyn Reed",
            currentEnrollment: 15,
            capacity: 25,
          },
          {
            classId: 302,
            courseName: "Database Systems",
            scheduleSummary: "Fri 09:00-10:00",
            teacherName: "Mr. Omar Khan",
            currentEnrollment: 24,
            capacity: 25,
          },
        ],
      } as TimeClashIssueContext,
      availableActions: ["SelectAlternative", "ForceEnroll"],
    },
  ],
});
