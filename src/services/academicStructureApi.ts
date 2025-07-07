import { API_BASE_URL, handleResponse } from "./api.helpers";
import type {
  AssignStudentToSectionRequest,
  CohortDetailDto,
  CreateCohortRequest,
  CreateSectionRequest,
  CreateStudentGroupRequest,
  SectionDetailDto,
  StudentGroupDetailDto,
} from "../interfaces/academicStructureDtos";

import type {
  BulkStructureRequestItem,
  StructureBulkImportResultDto,
} from "../interfaces/bulkImportDtos";
import {SummaryDto} from "../interfaces/formDataDtos.ts";

const ACADEMIC_STRUCTURE_URL = `${API_BASE_URL}/academic-structure`;
const TIMETABLE_API_URL = `${API_BASE_URL}/timetable`;

export const fetchCohortsForTimetable = async (
  timetableId: string,
): Promise<CohortDetailDto[]> => {
  const response = await fetch(`${TIMETABLE_API_URL}/${timetableId}/cohorts`);
  return handleResponse<CohortDetailDto[]>(response);
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

export const bulkImportStructure = async (
  timetableId: string,
  data: BulkStructureRequestItem[],
): Promise<StructureBulkImportResultDto> => {
  const response = await fetch(
    `${TIMETABLE_API_URL}/${timetableId}/academic-structure/bulk-import`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  );
  return handleResponse<StructureBulkImportResultDto>(response);
};

export const fetchCohortsForTimetableSummary = async (
    timetableId: string | number,
): Promise<SummaryDto[]> => {
  const response = await fetch(`${TIMETABLE_API_URL}/${timetableId}/cohorts-summary`);
  return handleResponse<SummaryDto[]>(response);
};

export const fetchGroupsForCohortSummary = async (
    cohortId: string | number,
): Promise<SummaryDto[]> => {
  const response = await fetch(`${ACADEMIC_STRUCTURE_URL}/cohorts/${cohortId}/groups-summary`);
  return handleResponse<SummaryDto[]>(response);
};

export const fetchSectionsForGroupSummary = async (
    groupId: string | number,
): Promise<SummaryDto[]> => {
  const response = await fetch(`${ACADEMIC_STRUCTURE_URL}/groups/${groupId}/sections-summary`);
  return handleResponse<SummaryDto[]>(response);
};