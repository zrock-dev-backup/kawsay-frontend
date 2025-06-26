export interface RequirementIssueDto {
  studentId: number;
  studentName: string;
  issueType: "Prerequisite" | "TimeClash" | "AdminHold" | "CourseLoadLimit";
  details: string;
}

export type AuditStatus = "ReadyToEnroll" | "ActionRequired" | "Enrolled";
export type AuditStatusFilter = "All" | AuditStatus;

export interface StudentAuditDto {
  studentId: number;
  studentName: string;
  studentGroupName: string;
  status: AuditStatus;
  issues?: string[];
  lastUpdated: string;
}

export interface BulkEnrollmentRequest {
  studentIds: number[];
  timetableId: string;
}

export interface AuditApiError {
  message: string;
  code: string;
  details?: Record<string, unknown>;
}
