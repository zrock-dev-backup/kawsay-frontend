import type { Class } from "../interfaces/classDtos.ts";
import {
  getMockCourses,
  getMockTeachers,
} from "./data/mockCoursesAndTeachers.ts";
import { getMockClasses } from "./data/mockClasses.ts";
import type { CourseRequirementDto } from "../interfaces/courseRequirementDtos.ts";
import type {
  RequirementIssueDto,
  StudentAuditDto,
} from "../interfaces/auditDtos.ts";
import type { AvailableClassDto } from "../interfaces/classDtos.ts";
import type {
  ProposedEnrollmentDto,
  StudentDto,
} from "../interfaces/studentDtos.ts";
import type { TimetableStructure } from "../interfaces/timetableDtos.ts";
import { getMockTimetables } from "./data/mockTimetables.ts";
import {
  getMockRequirements,
  getMockRequirementIssues,
} from "./data/mockRequirements.ts";
import {
  getMockStudents,
  getMockProposedEnrollments,
} from "./data/mockStudents.ts";
import { Course, Teacher } from "../interfaces/apiDataTypes.ts";
import { getMockCohorts } from "./data/mockAcademicStructure.ts";
import { CohortDetailDto } from "../interfaces/academicStructureDtos.ts";
import { getMockStudentAudit } from "./data/mockStudentAudit.ts";
import { StudentIssueDetailDto } from "../interfaces/issueDtos.ts";
import { getMockIssueDetails } from "./data/mockIssueDetails.ts";

class MockDb {
  public timetables: TimetableStructure[];
  public requirements: CourseRequirementDto[];
  public requirementIssues: Record<string, RequirementIssueDto[]>;
  public students: StudentDto[];
  public proposedEnrollments: Record<string, ProposedEnrollmentDto[]>;
  public studentAudit: StudentAuditDto[];
  public classes: Class[];
  public courses: Course[];
  public teachers: Teacher[];
  public availableClasses: AvailableClassDto[];
  public cohorts: CohortDetailDto[];
  public issueDetails: Record<string, StudentIssueDetailDto[]>;

  private nextTimetableId: number;
  private nextRequirementId: number;
  private nextClassId: number;
  private nextCohortId: number;
  private nextGroupId: number;
  private nextSectionId: number;

  constructor() {
    this.timetables = getMockTimetables();
    this.requirements = getMockRequirements();
    this.requirementIssues = getMockRequirementIssues();
    this.students = getMockStudents();
    this.proposedEnrollments = getMockProposedEnrollments();
    this.courses = getMockCourses();
    this.teachers = getMockTeachers();
    this.classes = getMockClasses();
    this.cohorts = getMockCohorts();
    this.studentAudit = getMockStudentAudit();
    this.issueDetails = getMockIssueDetails();
    this.availableClasses = [];

    this.nextTimetableId = this.timetables.length + 1;
    this.nextRequirementId = this.requirements.length + 1;
    this.nextClassId = this.classes.length + 1;
    this.nextCohortId = this.cohorts.length + 1;
    this.nextGroupId = 1000;
    this.nextSectionId = 10000;
  }

  public getNextTimetableId = (): number => this.nextTimetableId++;
  public getNextRequirementId = (): number => this.nextRequirementId++;
  public getNextClassId = (): number => this.nextClassId++;
  public getNextCohortId = (): number => this.nextCohortId++;
  public getNextGroupId = (): number => this.nextGroupId++;
  public getNextSectionId = (): number => this.nextSectionId++;
}

export const db = new MockDb();
