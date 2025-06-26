// src/mocks/db.ts
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
import { getMockAvailableClasses } from "./data/mockClasses.ts";

class MockDb {
  public timetables: TimetableStructure[];
  public requirements: CourseRequirementDto[];
  public requirementIssues: Record<string, RequirementIssueDto[]>;
  public students: StudentDto[];
  public proposedEnrollments: Record<string, ProposedEnrollmentDto[]>;
  public availableClasses: AvailableClassDto[];
  public studentAudit: StudentAuditDto[];

  private nextTimetableId: number;
  private nextRequirementId: number;

  constructor() {
    this.timetables = getMockTimetables();
    this.requirements = getMockRequirements();
    this.requirementIssues = getMockRequirementIssues();
    this.students = getMockStudents();
    this.proposedEnrollments = getMockProposedEnrollments();
    this.availableClasses = getMockAvailableClasses();

    this.nextTimetableId = this.timetables.length + 1;
    this.nextRequirementId = this.requirements.length + 1;
    this.studentAudit = [
      {
        studentId: 1001,
        studentName: "Jane Doe",
        studentGroupName: "Group A",
        status: "Enrolled",
        lastUpdated: "2023-10-26T10:00:00Z",
      },
    ];
  }

  public getNextTimetableId(): number {
    return this.nextTimetableId++;
  }

  public getNextRequirementId(): number {
    return this.nextRequirementId++;
  }
}

export const db = new MockDb();
