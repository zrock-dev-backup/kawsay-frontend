import { API_BASE_URL, apiRequest, handleResponse } from "./api.helpers";
import type {
  CourseRequirementDto,
  CreateCourseRequirementRequest,
  EligibilitySummary,
} from "../interfaces/courseRequirementDtos";
import type { RequirementIssueDto } from "../interfaces/auditDtos";
import type { CourseRequirementSyncResultDto } from "../interfaces/syncDtos.ts";

const REQ_URL = `${API_BASE_URL}/requirements`;

export interface PreflightCheckResult {
  summary: EligibilitySummary;
  ineligibleStudentIds: number[];
}

export const fetchRequirements = async (
  timetableId: number,
): Promise<CourseRequirementDto[]> => {
  return apiRequest<CourseRequirementDto[]>(
    `${REQ_URL}?timetableId=${timetableId}`,
    {
      cacheTtlMs: 30_000,
      retries: 2,
    },
  );
};

export const createRequirement = async (
  // The payload now officially includes the optional list of student IDs to flag
  data: CreateCourseRequirementRequest & {
    ineligibleStudentIdsToFlag?: number[];
  },
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

export const runPreflightCheckForRequirement = async (
  data: CreateCourseRequirementRequest,
): Promise<PreflightCheckResult> => {
  const response = await fetch(`${REQ_URL}/preflight-check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<PreflightCheckResult>(response);
};

export const syncRequirementsFromSource = async (
  timetableId: number,
): Promise<CourseRequirementSyncResultDto> => {
  return apiRequest<CourseRequirementSyncResultDto>(
    `${REQ_URL}/${timetableId}/sync`,
    {
      method: "POST",
      timeoutMs: 15_000,
      retries: 2,
    },
  );
};
