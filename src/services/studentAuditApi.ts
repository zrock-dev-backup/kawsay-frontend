import { API_BASE_URL, handleResponse } from "./api.helpers";
import type {
  BulkEnrollmentRequest,
  StudentAuditDto,
} from "../interfaces/auditDtos";

export const fetchStudentAudit = async (
  timetableId: string,
): Promise<StudentAuditDto[]> => {
  if (!timetableId) {
    throw new Error("Timetable ID is required");
  }

  const response = await fetch(
    `${API_BASE_URL}/timetables/${timetableId}/student-audit`,
  );
  return handleResponse<StudentAuditDto[]>(response);
};

export const bulkEnroll = async (
  request: BulkEnrollmentRequest,
): Promise<void> => {
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
};

export const resolveIssues = async (studentId: number): Promise<void> => {
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
};
