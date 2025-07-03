export type IssueType =
  | "Prerequisite"
  | "AdminHold"
  | "TimeClash"
  | "CourseLoadLimit";
export type ResolutionAction =
  | "Override"
  | "Acknowledge"
  | "SelectAlternative"
  | "ForceEnroll"
  | "RemoveItem";

interface BaseIssueContext {}

export interface PrerequisiteIssueContext extends BaseIssueContext {
  courseId: number;
  courseName: string;
  missingPrerequisites: {
    courseId: number;
    courseName: string;
  }[];
}

export interface TimeClashIssueContext extends BaseIssueContext {
  conflictingClasses: {
    classId: number;
    courseName: string;
    scheduleSummary: string;
  }[];
  suggestedAlternatives: {
    classId: number;
    courseName: string;
    scheduleSummary: string;
    teacherName: string;
    currentEnrollment: number;
    capacity: number;
  }[];
}

export interface AdminHoldIssueContext extends BaseIssueContext {
  holdReason: string;
}

export type IssueContext =
  | PrerequisiteIssueContext
  | TimeClashIssueContext
  | AdminHoldIssueContext;

export interface StudentIssueDetailDto {
  issueId: string;
  issueType: IssueType;
  message: string;
  context: IssueContext;
  availableActions: ResolutionAction[];
}

export interface ResolveIssueRequestDto {
  issueId: string;
  action: ResolutionAction;
  data?: {
    overrideReason?: string;
    selectedClassId?: number;
  };
}
