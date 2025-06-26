import type { CourseRequirementDto } from "../interfaces/courseRequirementDtos.ts";
import type { RequirementIssueDto, StudentAuditDto } from "../interfaces/auditDtos.ts";
import type { AvailableClassDto } from "../interfaces/classDtos.ts";
import type { ProposedEnrollmentDto, StudentDto } from "../interfaces/studentDtos.ts";
import dayjs from "dayjs";

class MockDb {
  // Course Requirement Data
  public requirements: CourseRequirementDto[];
  public requirementIssues: Record<string, RequirementIssueDto[]>;
  private nextRequirementId: number;

  // Student Data
  public students: StudentDto[];
  public proposedEnrollments: Record<string, ProposedEnrollmentDto[]>;
  public availableClasses: AvailableClassDto[];
  public studentAudit: StudentAuditDto[];

  constructor() {
    this.nextRequirementId = 3;
    this.requirements = [
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
    this.requirementIssues = {
      "2": [
        { studentId: 1002, studentName: "Peter Jones", issueType: "Prerequisite", details: "Missing prerequisite: MATH101 - Calculus I" },
        { studentId: 1025, studentName: "Emily White", issueType: "AdminHold", details: "Financial hold on account." },
        { studentId: 1030, studentName: "David Green", issueType: "CourseLoadLimit", details: "Exceeds maximum course load for academic probation status." },
      ],
    };

    this.students = [
      { id: 1, name: "Jane Doe", currentCourseLoad: 1, standing: "GoodStanding", proposedEnrollmentCount: 2 },
      { id: 2, name: "John Smith", currentCourseLoad: 3, standing: "GoodStanding", proposedEnrollmentCount: 0 },
      { id: 3, name: "Peter Jones", currentCourseLoad: 2, standing: "AcademicProbation", proposedEnrollmentCount: 1 },
      { id: 4, name: "Mary Williams", currentCourseLoad: 0, standing: "GoodStanding", proposedEnrollmentCount: 3 },
    ];

    this.proposedEnrollments = {
      "1": [
        { classId: 101, courseCode: "CSE401", courseName: "Advanced Software Engineering", teacherName: "Dr. Smith", reason: "Core curriculum requirement." },
        { classId: 102, courseCode: "AI201", courseName: "Machine Learning Fundamentals", teacherName: "Prof. Jones", reason: "Next course in AI track." },
      ],
      "3": [{ classId: 105, courseCode: "DB303-R", courseName: "Database Systems (Retake)", teacherName: "Dr. Davis", reason: "Required retake for failed module." }],
      "4": [
        { classId: 201, courseCode: "PHY101", courseName: "Physics I", teacherName: "Dr. Einstein", reason: "Core Science Requirement." },
        { classId: 202, courseCode: "CHEM101", courseName: "Chemistry I", teacherName: "Dr. Curie", reason: "Core Science Requirement." },
        { classId: 203, courseCode: "BIO101", courseName: "Biology I", teacherName: "Dr. Darwin", reason: "Core Science Requirement." },
      ],
    };

    this.availableClasses = [
      { id: 101, courseId: 1, teacherId: 1, courseCode: "CSE401", courseName: "Advanced Software Engineering", teacherName: "Dr. Smith", capacity: 30, currentEnrollment: 25, isEligible: true, isRetake: false, ineligibilityReason: null, length: 2, frequency: 2, classType: "Masterclass", startDate: null, endDate: null, timetableId: 1, classOccurrences: [], periodPreferences: [] },
      { id: 102, courseId: 2, teacherId: 2, courseCode: "AI201", courseName: "Machine Learning Fundamentals", teacherName: "Prof. Jones", capacity: 25, currentEnrollment: 25, isEligible: false, isRetake: false, ineligibilityReason: "Class is full.", length: 2, frequency: 2, classType: "Masterclass", startDate: null, endDate: null, timetableId: 1, classOccurrences: [], periodPreferences: [] },
      { id: 105, courseId: 3, teacherId: 3, courseCode: "DB303-R", courseName: "Database Systems (Retake)", teacherName: "Dr. Davis", capacity: 15, currentEnrollment: 5, isEligible: true, isRetake: true, ineligibilityReason: null, length: 2, frequency: 2, classType: "Masterclass", startDate: null, endDate: null, timetableId: 1, classOccurrences: [], periodPreferences: [] },
    ];

    this.studentAudit = [
      { studentId: 1001, studentName: "Jane Doe", studentGroupId: 101, studentGroupName: "Group A", status: "ReadyToEnroll", issueCount: 0 },
      { studentId: 1002, studentName: "Peter Jones", studentGroupId: 101, studentGroupName: "Group A", status: "ActionRequired", issueCount: 1 },
      { studentId: 1003, studentName: "John Smith", studentGroupId: 102, studentGroupName: "Group B", status: "Enrolled", issueCount: 0 },
      { studentId: 1025, studentName: "Emily White", studentGroupId: 101, studentGroupName: "Group A", status: "ActionRequired", issueCount: 1 },
    ];
  }

  public getNextRequirementId(): number {
    return this.nextRequirementId++;
  }
}

export const db = new MockDb();
