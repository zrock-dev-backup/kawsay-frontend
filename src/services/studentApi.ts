import { API_BASE_URL, handleResponse } from "./api.helpers.ts";
import type {
  StudentDto,
  StudentEnrollmentDto,
  ProposedEnrollmentDto,
} from "../interfaces/studentDtos.ts";
import type { AvailableClassDto } from "../interfaces/classDtos.ts";

const STUDENT_URL = `${API_BASE_URL}/Students`;

export const fetchStudents = async (
  timetableId: number,
): Promise<StudentDto[]> => {
  const response = await fetch(`${STUDENT_URL}?timetableId=${timetableId}`);
  return handleResponse<StudentDto[]>(response);
};

export const fetchProposedEnrollmentsForStudent = async (
  studentId: number,
): Promise<ProposedEnrollmentDto[]> => {
  const response = await fetch(
    `${STUDENT_URL}/${studentId}/proposed-enrollments`,
  );
  return handleResponse<ProposedEnrollmentDto[]>(response);
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
