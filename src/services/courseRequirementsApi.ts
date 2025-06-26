import { API_BASE_URL, handleResponse } from "./api.helpers";
import type {
  CourseRequirementDto,
  CreateCourseRequirementRequest,
} from "../interfaces/courseRequirementDtos";
import type { RequirementIssueDto } from "../interfaces/auditDtos";

const REQ_URL = `${API_BASE_URL}/requirements`;

export const fetchRequirements = async (
  timetableId: number,
): Promise<CourseRequirementDto[]> => {
  const response = await fetch(`${REQ_URL}?timetableId=${timetableId}`);
  return handleResponse<CourseRequirementDto[]>(response);
};

export const createRequirement = async (
  data: CreateCourseRequirementRequest,
): Promise<CourseRequirementDto> => {
  const response = await fetch(REQ_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<CourseRequirementDto>(response);
};

export const updateRequirement = async (
  id: number,
  data: Partial<CreateCourseRequirementRequest>,
): Promise<CourseRequirementDto> => {
  const response = await fetch(`${REQ_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<CourseRequirementDto>(response);
};

export const deleteRequirement = async (id: number): Promise<void> => {
  const response = await fetch(`${REQ_URL}/${id}`, {
    method: "DELETE",
  });
  await handleResponse<void>(response);
};

export const fetchRequirementById = async (
  id: number,
): Promise<CourseRequirementDto> => {
  const response = await fetch(`${REQ_URL}/${id}`);
  return handleResponse<CourseRequirementDto>(response);
};

export const runPreflightCheck = async (id: number): Promise<void> => {
  const response = await fetch(`${REQ_URL}/${id}/run-preflight-check`, {
    method: "POST",
  });
  await handleResponse<void>(response);
};

export const fetchRequirementIssues = async (
  id: number,
): Promise<RequirementIssueDto[]> => {
  const response = await fetch(`${REQ_URL}/${id}/issues`);
  return handleResponse<RequirementIssueDto[]>(response);
};
