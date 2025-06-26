import { API_BASE_URL, handleResponse } from "./api.helpers";
import type {
  CreateTimetableRequest,
  TimetableStructure,
} from "../interfaces/timetableDtos.ts";

const TIMETABLE_URL = `${API_BASE_URL}/timetable`;

export const fetchTimetables = async (): Promise<TimetableStructure[]> => {
  const response = await fetch(`${API_BASE_URL}/timetables`);
  return handleResponse<TimetableStructure[]>(response);
};

export const createTimetable = async (
  data: CreateTimetableRequest,
): Promise<TimetableStructure> => {
  const response = await fetch(TIMETABLE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });
  return handleResponse<TimetableStructure>(response);
};

export const fetchTimetableStructureById = async (
  id: string | number,
): Promise<TimetableStructure> => {
  const response = await fetch(`${TIMETABLE_URL}/${id}`);
  return handleResponse<TimetableStructure>(response);
};

export const publishTimetable = async (
  timetableId: string | number,
): Promise<TimetableStructure> => {
  const response = await fetch(`${TIMETABLE_URL}/${timetableId}/publish`, {
    method: "POST",
  });
  return handleResponse<TimetableStructure>(response);
};
