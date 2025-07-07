import { API_BASE_URL, handleResponse } from "./api.helpers";
import type {
  CourseRequirementDto,
  CreateCourseRequirementRequest,
  EligibilitySummary,
} from "../interfaces/courseRequirementDtos";
import type { RequirementIssueDto } from "../interfaces/auditDtos";
import type {
  BulkImportResultDto,
  BulkRequirementRequestItem,
} from "../interfaces/bulkImportDtos";

const REQ_URL = `${API_BASE_URL}/requirements`;

export interface PreflightCheckResult {
  summary: EligibilitySummary;
  ineligibleStudentIds: number[];
}

export const fetchRequirements = async (
  timetableId: number,
): Promise<CourseRequirementDto[]> => {
  const response = await fetch(`${REQ_URL}?timetableId=${timetableId}`);
  return handleResponse<CourseRequirementDto[]>(response);
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

export const bulkCreateRequirements = async (
  data: BulkRequirementRequestItem[],
): Promise<BulkImportResultDto> => {
  const response = await fetch(`${REQ_URL}/bulk-import`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<BulkImportResultDto>(response);
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
