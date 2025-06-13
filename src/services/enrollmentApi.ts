import { API_BASE_URL, handleResponse } from "./api.helpers.ts";

interface EnrollmentRequest {
  studentId: number;
  classId: number;
  force: boolean;
}

interface EnrollmentResponse {
  id: number;
  studentId: number;
  classId: number;
  enrollmentDate: string;
}

export const enrollStudent = async (
  payload: EnrollmentRequest,
): Promise<EnrollmentResponse> => {
  const response = await fetch(`${API_BASE_URL}/enrollments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<EnrollmentResponse>(response);
};
