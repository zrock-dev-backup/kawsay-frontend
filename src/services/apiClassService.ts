import { API_BASE_URL, handleResponse } from "./api.helpers";
import type { Class, ClassFormState } from "../interfaces/classDtos";

interface GenerateScheduleResponse {
  message: string;
}

type CreateOrUpdateClassRequest = Omit<ClassFormState, "id">;

export const fetchClassesForTimetable = async (
  timetableId: string | number,
): Promise<Class[]> => {
  const response = await fetch(
    `${API_BASE_URL}/classes?timetableId=${timetableId}`,
  );
  return handleResponse<Class[]>(response);
};

export const fetchClassById = async (
  classId: string | number,
): Promise<Class> => {
  const response = await fetch(`${API_BASE_URL}/class/${classId}`);
  return handleResponse<Class>(response);
};

export const createClass = async (
  data: CreateOrUpdateClassRequest,
): Promise<Class> => {
  const response = await fetch(`${API_BASE_URL}/class`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<Class>(response);
};

export const updateClass = async (
  id: number,
  data: CreateOrUpdateClassRequest,
): Promise<Class> => {
  const response = await fetch(`${API_BASE_URL}/class/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<Class>(response);
};

export const deleteClass = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/class/${id}`, {
    method: "DELETE",
  });
  await handleResponse<void>(response);
};
