import type { CourseRequirementDto } from "../../interfaces/courseRequirementDtos";
import type { RequirementIssueDto } from "../../interfaces/auditDtos";
import dayjs from "dayjs";

export const getMockRequirements = (): CourseRequirementDto[] => {
  const groups = [
    { id: 101, name: "Fall 2025 - Group A", sectionId: 1001, sectionName: "Lab A1" },
    { id: 102, name: "Fall 2025 - Group B", sectionId: 1003, sectionName: "Lab B1" },
    { id: 201, name: "Spring 2026 - Group A", sectionId: 2001, sectionName: "Lab S1" },
  ];
  const courses = [
    { id: 1, name: "Advanced Software Engineering" },
    { id: 2, name: "Machine Learning Fundamentals" },
    { id: 3, name: "Database Systems" },
    { id: 4, name: "Operating Systems" },
    { id: 5, name: "Computer Networks" },
    { id: 6, name: "Software Testing and QA" },
    { id: 7, name: "Human-Computer Interaction" },
    { id: 8, name: "Probability and Statistics" },
    { id: 9, name: "Linear Algebra" },
    { id: 10, name: "Introduction to AI" },
  ];

  const priorities: CourseRequirementDto["priority"][] = ["High", "Medium", "Low"];

  const requirements: CourseRequirementDto[] = [];
  let nextId = 1;

  for (const g of groups) {
    for (let i = 0; i < 8; i++) {
      const c = courses[(nextId - 1) % courses.length];
      const priority = priorities[nextId % priorities.length];
      const start = dayjs().add(1 + (nextId % 4), "week").format("YYYY-MM-DD");
      const end = dayjs().add(8 + (nextId % 6), "week").format("YYYY-MM-DD");

      requirements.push({
        id: nextId,
        timetableId: g.id === 201 ? 2 : 1,
        courseId: c.id,
        courseName: c.name,
        studentGroupId: g.id,
        studentGroupName: g.name,
        studentSectionId: g.sectionId,
        studentSectionName: g.sectionName,
        classType: nextId % 3 === 0 ? "Lab" : "Masterclass",
        length: 1 + (nextId % 3),
        frequency: 1 + (nextId % 2),
        priority,
        requiredTeacherId: nextId % 5 === 0 ? 5 : null,
        startDate: start,
        endDate: end,
        schedulingPreferences: [],
        eligibilitySummary:
          priority === "High"
            ? null
            : { eligible: 20 + (nextId % 30), total: 30 + (nextId % 30), issues: nextId % 4 },
      });

      nextId++;
    }
  }

  return requirements;
};

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
    {
      studentId: 1099,
      studentName: "Lucas Silva",
      issueType: "CourseLoadLimit",
      details: "Requesting overload approval based on high GPA.",
    },
  ],
});