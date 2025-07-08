import { API_BASE_URL, handleResponse } from "./api.helpers";
import type {
  TeacherDto,
  CreateTeacherRequestDto,
  UpdateTeacherRequestDto,
} from "../interfaces/teacherDtos";

const FACULTY_URL = `${API_BASE_URL}/teachers`;

export const fetchTeachers = async (): Promise<TeacherDto[]> => {
  const response = await fetch(FACULTY_URL);
  return handleResponse<TeacherDto[]>(response);
};

export const createTeacher = async (
  data: CreateTeacherRequestDto,
): Promise<TeacherDto> => {
  const response = await fetch(FACULTY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<TeacherDto>(response);
};

export const updateTeacher = async (
  id: number,
  data: UpdateTeacherRequestDto,
): Promise<TeacherDto> => {
  const response = await fetch(`${FACULTY_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<TeacherDto>(response);
};

export const deleteTeacher = async (id: number): Promise<void> => {
  const response = await fetch(`${FACULTY_URL}/${id}`, {
    method: "DELETE",
  });
  await handleResponse<void>(response);
};
