import { API_BASE_URL, apiRequest } from "./api.helpers";
import type {
  EnrollmentProposalResultDto,
  GradeSyncReportDto,
} from "../interfaces/eomDtos";

const EOM_URL = `${API_BASE_URL}/eom`;

export const syncGradesFromSource = async (
  timetableId: string | number,
): Promise<GradeSyncReportDto> => {
  return apiRequest<GradeSyncReportDto>(
    `${EOM_URL}/${timetableId}/sync-grades`,
    {
      method: "POST",
      timeoutMs: 20_000,
      retries: 2,
      retryDelayMs: 600,
    },
  );
};

export const prepareEnrollmentProposals = async (
  timetableId: string | number,
  destinationTimetableId: string | number,
): Promise<EnrollmentProposalResultDto> => {
  return apiRequest<EnrollmentProposalResultDto>(
    `${EOM_URL}/${timetableId}/prepare-enrollments`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destinationTimetableId }),
      timeoutMs: 15_000,
      retries: 1,
    },
  );
};

