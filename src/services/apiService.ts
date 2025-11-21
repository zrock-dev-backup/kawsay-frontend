import { API_BASE_URL, handleResponse } from "./api.helpers";
import type { Course, Teacher } from "../interfaces/apiDataTypes";
import type {
  CreateTimetableRequest,
  TimetableStructure,
} from "../interfaces/timetableDtos.ts";
import { Class } from "../interfaces/classDtos.ts";

interface GenerateScheduleResponse {
  message: string;
}

export const fetchCourses = async (): Promise<Course[]> => {
  console.log(`Fetching courses from ${API_BASE_URL}/courses`);
  const response = await fetch(`${API_BASE_URL}/courses`);
  return handleResponse<Course[]>(response);
};
export const fetchTeachers = async (): Promise<Teacher[]> => {
  console.log(`Fetching teachers from ${API_BASE_URL}/teachers`);
  const response = await fetch(`${API_BASE_URL}/teachers`);
  return handleResponse<Teacher[]>(response);
};

export const fetchTimetables = async (): Promise<TimetableStructure[]> => {
  const response = await fetch(`${API_BASE_URL}/timetables`);
  return handleResponse<TimetableStructure[]>(response);
};

export const createTimetable = async (
  data: CreateTimetableRequest,
): Promise<TimetableStructure> => {
  const response = await fetch(`${API_BASE_URL}/timetable`, {
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
  const response = await fetch(`${API_BASE_URL}/timetable/${id}`);
  return handleResponse<TimetableStructure>(response);
};

export const publishTimetable = async (
  timetableId: string | number,
): Promise<TimetableStructure> => {
  const response = await fetch(
    `${API_BASE_URL}/timetable/${timetableId}/publish`,
    {
      method: "POST",
    },
  );
  return handleResponse<TimetableStructure>(response);
};

export const fetchClassesForTimetable = async (
  timetableId: string | number,
): Promise<Class[]> => {
  console.log(
    `Fetching classes for timetable ID ${timetableId} from ${API_BASE_URL}/classes?timetableId=${timetableId}`,
  );
  const response = await fetch(
    `${API_BASE_URL}/classes?timetableId=${timetableId}`,
  );
  return handleResponse<Class[]>(response);
};
export const generateScheduleForTimetable = async (
  timetableId: string | number,
): Promise<GenerateScheduleResponse> => {
  console.log(
    `Requesting schedule generation for timetable ID ${timetableId} at ${API_BASE_URL}/scheduling/generate/${timetableId}`,
  );
  const response = await fetch(
    `${API_BASE_URL}/scheduling/generate/${timetableId}`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    },
  );
  return handleResponse<GenerateScheduleResponse>(response);
};
