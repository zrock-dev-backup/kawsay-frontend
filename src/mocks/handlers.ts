import { delay, http, HttpResponse } from "msw";

import { API_BASE_URL } from "../services/api.helpers";
import type {
  ProposedEnrollmentDto,
  StudentDto,
} from "../interfaces/studentDtos";
import type { AvailableClassDto } from "../interfaces/classDtos";
import {
  RequirementIssueDto,
  StudentAuditDto,
} from "../interfaces/auditDtos.ts";
import { CourseRequirementDto } from "../interfaces/courseRequirementDtos.ts";

const mockStudents: StudentDto[] = [
  {
    id: 1,
    name: "Jane Doe",
    currentCourseLoad: 1,
    standing: "GoodStanding",
    proposedEnrollmentCount: 2,
  },
  {
    id: 2,
    name: "John Smith",
    currentCourseLoad: 3,
    standing: "GoodStanding",
    proposedEnrollmentCount: 0,
  },
  {
    id: 3,
    name: "Peter Jones",
    currentCourseLoad: 2,
    standing: "AcademicProbation",
    proposedEnrollmentCount: 1,
  },
  {
    id: 4,
    name: "Mary Williams",
    currentCourseLoad: 0,
    standing: "GoodStanding",
    proposedEnrollmentCount: 3,
  },
];

const mockProposals: Record<string, ProposedEnrollmentDto[]> = {
  "1": [
    {
      classId: 101,
      courseCode: "CSE401",
      courseName: "Advanced Software Engineering",
      teacherName: "Dr. Smith",
      reason: "Core curriculum requirement.",
    },
    {
      classId: 102,
      courseCode: "AI201",
      courseName: "Machine Learning Fundamentals",
      teacherName: "Prof. Jones",
      reason: "Next course in AI track.",
    },
  ],
  "3": [
    {
      classId: 105,
      courseCode: "DB303-R",
      courseName: "Database Systems (Retake)",
      teacherName: "Dr. Davis",
      reason: "Required retake for failed module.",
    },
  ],
  "4": [
    {
      classId: 201,
      courseCode: "PHY101",
      courseName: "Physics I",
      teacherName: "Dr. Einstein",
      reason: "Core Science Requirement.",
    },
    {
      classId: 202,
      courseCode: "CHEM101",
      courseName: "Chemistry I",
      teacherName: "Dr. Curie",
      reason: "Core Science Requirement.",
    },
    {
      classId: 203,
      courseCode: "BIO101",
      courseName: "Biology I",
      teacherName: "Dr. Darwin",
      reason: "Core Science Requirement.",
    },
  ],
};

const mockAvailableClasses: AvailableClassDto[] = [
  {
    id: 101,
    courseId: 1,
    teacherId: 1,
    courseCode: "CSE401",
    courseName: "Advanced Software Engineering",
    teacherName: "Dr. Smith",
    capacity: 30,
    currentEnrollment: 25,
    isEligible: true,
    isRetake: false,
    ineligibilityReason: null,
    length: 2,
    frequency: 2,
    classType: "Masterclass",
    startDate: null,
    endDate: null,
    timetableId: 1,
    classOccurrences: [],
    periodPreferences: [],
  },
  {
    id: 102,
    courseId: 2,
    teacherId: 2,
    courseCode: "AI201",
    courseName: "Machine Learning Fundamentals",
    teacherName: "Prof. Jones",
    capacity: 25,
    currentEnrollment: 25,
    isEligible: false,
    isRetake: false,
    ineligibilityReason: "Class is full.",
    length: 2,
    frequency: 2,
    classType: "Masterclass",
    startDate: null,
    endDate: null,
    timetableId: 1,
    classOccurrences: [],
    periodPreferences: [],
  },
  {
    id: 105,
    courseId: 3,
    teacherId: 3,
    courseCode: "DB303-R",
    courseName: "Database Systems (Retake)",
    teacherName: "Dr. Davis",
    capacity: 15,
    currentEnrollment: 5,
    isEligible: true,
    isRetake: true,
    ineligibilityReason: null,
    length: 2,
    frequency: 2,
    classType: "Masterclass",
    startDate: null,
    endDate: null,
    timetableId: 1,
    classOccurrences: [],
    periodPreferences: [],
  },
];

const mockCourseRequirements: CourseRequirementDto[] = [
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
    startDate: "2025-09-01",
    endDate: "2025-12-15",
    schedulingPreferences: [],
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
    requiredTeacherId: null,
    startDate: "2025-09-01",
    endDate: "2025-12-15",
    schedulingPreferences: [],
    eligibilitySummary: { eligible: 47, total: 50, issues: 3 },
  },
];

const mockRequirementIssues: Record<string, RequirementIssueDto[]> = {
  "2": [
    // Issues for Requirement ID 2
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
      studentId: 1030,
      studentName: "David Green",
      issueType: "CourseLoadLimit",
      details: "Exceeds maximum course load for academic probation status.",
    },
  ],
};

const mockStudentAudit: StudentAuditDto[] = [
  {
    studentId: 1001,
    studentName: "Jane Doe",
    studentGroupId: 101,
    studentGroupName: "Group A",
    status: "ReadyToEnroll",
    issueCount: 0,
  },
  {
    studentId: 1002,
    studentName: "Peter Jones",
    studentGroupId: 101,
    studentGroupName: "Group A",
    status: "ActionRequired",
    issueCount: 1,
  },
  {
    studentId: 1003,
    studentName: "John Smith",
    studentGroupId: 102,
    studentGroupName: "Group B",
    status: "Enrolled",
    issueCount: 0,
  },
  {
    studentId: 1025,
    studentName: "Emily White",
    studentGroupId: 101,
    studentGroupName: "Group A",
    status: "ActionRequired",
    issueCount: 1,
  },
];

export const handlers = [
  http.get(`${API_BASE_URL}/Students`, () => {
    return HttpResponse.json(mockStudents);
  }),

  http.get(
    `${API_BASE_URL}/Students/:studentId/proposed-enrollments`,
    async ({ params }) => {
      const { studentId } = params;
      const studentProposals = mockProposals[studentId as string] || [];

      await delay(150);
      return HttpResponse.json(studentProposals);
    },
  ),

  http.get(
    `${API_BASE_URL}/Students/:studentId/available-classes`,
    async () => {
      await delay(250);
      return HttpResponse.json(mockAvailableClasses);
    },
  ),

  http.post(`${API_BASE_URL}/students/bulk-import`, async ({ request }) => {
    const body = (await request.json()) as { id: number; name: string }[];
    const errors: { csvRow: number; studentId: number; error: string }[] = [];

    const invalidRow = body.find((s) => s.id === 9999);
    if (invalidRow) {
      errors.push({
        csvRow: body.indexOf(invalidRow) + 1,
        studentId: 9999,
        error: "Student ID 9999 does not exist in the database.",
      });
    }

    await delay(800);
    return HttpResponse.json({
      processedCount: body.length - errors.length,
      failedCount: errors.length,
      errors: errors,
    });
  }),

  http.post(
    `${API_BASE_URL}/eom/:timetableId/ingest-grades`,
    async ({ request }) => {
      await delay(1000); // Simulate processing

      return HttpResponse.json({
        processedCount: 150,
        failedCount: 0,
        errors: [],
        retakeDemand: [
          { courseCode: "DB303", studentCount: 15 },
          { courseCode: "PHY101", studentCount: 8 },
        ],
        advancingCohorts: [
          { cohortName: "Fall 2024 - Group A", studentCount: 45 },
          { cohortName: "Fall 2024 - Group B", studentCount: 42 },
        ],
      });
    },
  ),

  // proposal creation mock
  http.post(
    `${API_BASE_URL}/eom/:timetableId/prepare-enrollments`,
    async ({ request }) => {
      const body = (await request.json()) as { destinationTimetableId: string };

      await delay(1500);
      return HttpResponse.json({
        message: `Successfully prepared 23 enrollment proposals for Module ${body.destinationTimetableId}.`,
        proposalsCreated: 23,
      });
    },
  ),

  http.post(
    `${API_BASE_URL}/requirements/:id/run-preflight-check`,
    async ({ params }) => {
      const { id } = params;
      const reqIndex = mockCourseRequirements.findIndex(
        (r) => r.id === Number(id),
      );

      if (reqIndex !== -1) {
        // Simulate the check by updating the mock data.
        mockCourseRequirements[reqIndex].eligibilitySummary = {
          eligible: 47,
          total: 50,
          issues: 3,
        };
      }

      await delay(1200); // Simulate check duration
      return new HttpResponse(null, { status: 202 }); // Accepted
    },
  ),

  http.get(`${API_BASE_URL}/requirements/:id/issues`, async ({ params }) => {
    const { id } = params;
    const issues = mockRequirementIssues[id as string] || [];

    await delay(400);
    return HttpResponse.json(issues);
  }),

  http.get(`${API_BASE_URL}/timetables/:id/student-audit`, async () => {
    await delay(800);
    return HttpResponse.json(mockStudentAudit);
  }),

  http.get(`${API_BASE_URL}/requirements`, () => {
    return HttpResponse.json(mockCourseRequirements);
  }),
];
