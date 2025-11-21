import { API_BASE_URL, apiRequest, handleResponse } from "./api.helpers";
import type {
  AssignStudentToSectionRequest,
  CohortDetailDto,
  CreateCohortRequest,
  CreateSectionRequest,
  CreateStudentGroupRequest,
  SectionDetailDto,
  StudentGroupDetailDto,
} from "../interfaces/academicStructureDtos";

import { SummaryDto } from "../interfaces/formDataDtos.ts";
import type {
  CreateTimetableAssignmentRequestDto,
  TimetableAssignmentDto,
} from "../interfaces/teacherDtos.ts";
import type { AcademicStructureSyncResultDto } from "../interfaces/syncDtos.ts";

const ACADEMIC_STRUCTURE_URL = `${API_BASE_URL}/academic-structure`;
const TIMETABLE_API_URL = `${API_BASE_URL}/timetable`;

export const fetchCohortsForTimetable = async (
  timetableId: string,
): Promise<CohortDetailDto[]> => {
  return apiRequest<CohortDetailDto[]>(
    `${TIMETABLE_API_URL}/${timetableId}/cohorts`,
    {
      cacheTtlMs: 30_000,
      retries: 2,
    },
  );
};

export const createCohort = async (
  data: CreateCohortRequest,
): Promise<CohortDetailDto> => {
  const response = await fetch(`${ACADEMIC_STRUCTURE_URL}/cohorts`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<CohortDetailDto>(response);
};

export const getCohortDetails = async (
  cohortId: number,
): Promise<CohortDetailDto> => {
  const response = await fetch(`${ACADEMIC_STRUCTURE_URL}/cohorts/${cohortId}`);
  return handleResponse<CohortDetailDto>(response);
};

export const createStudentGroup = async (
  data: CreateStudentGroupRequest,
): Promise<StudentGroupDetailDto> => {
  const response = await fetch(`${ACADEMIC_STRUCTURE_URL}/groups`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<StudentGroupDetailDto>(response);
};

export const createSection = async (
  data: CreateSectionRequest,
): Promise<SectionDetailDto> => {
  const response = await fetch(`${ACADEMIC_STRUCTURE_URL}/sections`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<SectionDetailDto>(response);
};

export const assignStudentToSection = async (
  data: AssignStudentToSectionRequest,
): Promise<void> => {
  const response = await fetch(`${ACADEMIC_STRUCTURE_URL}/sections/students`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  await handleResponse<void>(response); // Expecting 204 No Content
};

export const syncAcademicStructureFromSource = async (
  timetableId: string,
): Promise<AcademicStructureSyncResultDto> => {
  return apiRequest<AcademicStructureSyncResultDto>(
    `${TIMETABLE_API_URL}/${timetableId}/academic-structure/sync`,
    {
      method: "POST",
      timeoutMs: 15_000,
      retries: 2,
    },
  );
};

export const fetchCohortsForTimetableSummary = async (
  timetableId: string | number,
): Promise<SummaryDto[]> => {
  return apiRequest<SummaryDto[]>(
    `${TIMETABLE_API_URL}/${timetableId}/cohorts-summary`,
    {
      cacheTtlMs: 60_000,
      retries: 1,
    },
  );
};

export const fetchGroupsForCohortSummary = async (
  cohortId: string | number,
): Promise<SummaryDto[]> => {
  return apiRequest<SummaryDto[]>(
    `${ACADEMIC_STRUCTURE_URL}/cohorts/${cohortId}/groups-summary`,
    {
      cacheTtlMs: 60_000,
    },
  );
};

export const fetchSectionsForGroupSummary = async (
  groupId: string | number,
): Promise<SummaryDto[]> => {
  return apiRequest<SummaryDto[]>(
    `${ACADEMIC_STRUCTURE_URL}/groups/${groupId}/sections-summary`,
    {
      cacheTtlMs: 60_000,
    },
  );
};

export const fetchAssignmentsForTimetable = async (
  timetableId: string,
): Promise<TimetableAssignmentDto[]> => {
  return apiRequest<TimetableAssignmentDto[]>(
    `${TIMETABLE_API_URL}/${timetableId}/assignments`,
    {
      cacheTtlMs: 15_000,
      retries: 1,
    },
  );
};

export const createAssignment = async (
  timetableId: string,
  data: CreateTimetableAssignmentRequestDto,
): Promise<TimetableAssignmentDto> => {
  const response = await fetch(
    `${TIMETABLE_API_URL}/${timetableId}/assignments`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    },
  );
  return handleResponse<TimetableAssignmentDto>(response);
};

export const deleteAssignment = async (
  timetableId: string,
  assignmentId: number,
): Promise<void> => {
  const response = await fetch(
    `${TIMETABLE_API_URL}/${timetableId}/assignments/${assignmentId}`,
    {
      method: "DELETE",
    },
  );
  await handleResponse<void>(response);
};
