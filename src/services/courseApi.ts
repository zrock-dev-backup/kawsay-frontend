import { API_BASE_URL, handleResponse } from "./api.helpers.ts";
import type { Teacher } from "../interfaces/apiDataTypes.ts";
import {CourseSummaryDto} from "../interfaces/formDataDtos.ts";

const COURSE_URL = `${API_BASE_URL}/courses`;

export const fetchCoursesForForm = async (): Promise<CourseSummaryDto[]> => {
  const response = await fetch(`${COURSE_URL}/summary`);
  return handleResponse<CourseSummaryDto[]>(response);
};

export const getQualifiedTeachersForCourse = async (
  courseId: number,
): Promise<Teacher[]> => {
  const response = await fetch(`${COURSE_URL}/${courseId}/qualified-teachers`);
  return handleResponse<Teacher[]>(response);
};
