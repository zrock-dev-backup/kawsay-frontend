import { API_BASE_URL, handleResponse } from "./api.helpers.ts";
import type {
  StudentDto,
  StudentEnrollmentDto,
} from "../interfaces/apiDataTypes.ts";
import type { AvailableClassDto } from "../interfaces/classDtos.ts";

const STUDENT_URL = `${API_BASE_URL}/students`;

export const fetchStudents = async (): Promise<StudentDto[]> => {
  const response = await fetch(STUDENT_URL);
  return handleResponse<StudentDto[]>(response);
};

export const fetchStudentEnrollments = async (
  studentId: number,
  timetableId: number,
): Promise<StudentEnrollmentDto[]> => {
  const response = await fetch(
    `${STUDENT_URL}/${studentId}/enrollments?timetableId=${timetableId}`,
  );
  return handleResponse<StudentEnrollmentDto[]>(response);
};

export const fetchAvailableClassesForStudent = async (
  studentId: number,
  timetableId: number,
): Promise<AvailableClassDto[]> => {
  const response = await fetch(
    `${STUDENT_URL}/${studentId}/available-classes?timetableId=${timetableId}`,
  );
  return handleResponse<AvailableClassDto[]>(response);
};
