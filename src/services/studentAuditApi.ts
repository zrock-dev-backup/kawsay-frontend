import { API_BASE_URL, handleResponse } from "./api.helpers";
import type {
  BulkEnrollmentRequest,
  StudentAuditDto,
} from "../interfaces/auditDtos";
import type {
  ResolveIssueRequestDto,
  StudentIssueDetailDto,
} from "../interfaces/issueDtos";

const AUDIT_URL = `${API_BASE_URL}/timetables`;
const STUDENT_URL = `${API_BASE_URL}/students`;

export const fetchStudentAudit = async (
  timetableId: string,
): Promise<StudentAuditDto[]> => {
  if (!timetableId) {
    throw new Error("Timetable ID is required");
  }

  const response = await fetch(`${AUDIT_URL}/${timetableId}/student-audit`);
  return handleResponse<StudentAuditDto[]>(response);
};

export const bulkEnroll = async (
  request: BulkEnrollmentRequest,
): Promise<void> => {
  if (!request.timetableId || !request.studentIds.length) {
    throw new Error("Valid timetable ID and student IDs are required");
  }

  const response = await fetch(
    `${AUDIT_URL}/${request.timetableId}/bulk-enroll`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentIds: request.studentIds }),
    },
  );

  return handleResponse<void>(response);
};

export const fetchStudentIssues = async (
  studentId: number,
): Promise<StudentIssueDetailDto[]> => {
  if (!studentId || studentId <= 0) {
    throw new Error("A valid student ID is required.");
  }
  const response = await fetch(`${STUDENT_URL}/${studentId}/issues`);
  return handleResponse<StudentIssueDetailDto[]>(response);
};

export const resolveStudentIssue = async (
  studentId: number,
  payload: ResolveIssueRequestDto,
): Promise<void> => {
  if (!studentId || studentId <= 0) {
    throw new Error("A valid student ID is required.");
  }
  const response = await fetch(`${STUDENT_URL}/${studentId}/resolve-issue`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<void>(response);
};
