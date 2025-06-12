import { API_BASE_URL, handleResponse } from "./api.helpers.ts";
import type { Teacher } from "../interfaces/apiDataTypes.ts";

const COURSE_URL = `${API_BASE_URL}/Courses`;

export const getQualifiedTeachersForCourse = async (
  courseId: number,
): Promise<Teacher[]> => {
  const response = await fetch(`${COURSE_URL}/${courseId}/qualified-teachers`);
  return handleResponse<Teacher[]>(response);
};
