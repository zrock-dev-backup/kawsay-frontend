import { API_BASE_URL } from "./api.helpers";
import type {
  AuditApiError,
  BulkEnrollmentRequest,
  StudentAuditDto,
} from "../interfaces/auditDtos";

export async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData: AuditApiError;

    try {
      errorData = await response.json();
    } catch {
      // Fallback if response body is not valid JSON
      errorData = {
        message: `HTTP ${response.status}: ${response.statusText}`,
        code: response.status.toString(),
      };
    }

    throw new Error(errorData.message);
  }

  return response.json();
}

export async function fetchStudentAudit(
  timetableId: string,
): Promise<StudentAuditDto[]> {
  if (!timetableId) {
    throw new Error("Timetable ID is required");
  }

  const response = await fetch(
    `${API_BASE_URL}/timetables/${timetableId}/student-audit`,
  );
  return handleResponse<StudentAuditDto[]>(response);
}

export async function bulkEnroll(
  request: BulkEnrollmentRequest,
): Promise<void> {
  if (!request.timetableId || !request.studentIds.length) {
    throw new Error("Valid timetable ID and student IDs are required");
  }

  const response = await fetch(
    `${API_BASE_URL}/timetables/${request.timetableId}/bulk-enroll`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentIds: request.studentIds }),
    },
  );

  return handleResponse<void>(response);
}

export async function resolveIssues(studentId: number): Promise<void> {
  if (!studentId || studentId <= 0) {
    throw new Error("Valid student ID is required");
  }

  const response = await fetch(
    `${API_BASE_URL}/students/${studentId}/resolve-issues`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
  );

  return handleResponse<void>(response);
}
