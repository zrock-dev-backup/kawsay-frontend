import { API_BASE_URL, handleResponse } from "./api.helpers.ts";
import type {
  FinalizeScheduleRequest,
  FinalizeScheduleResponse,
  StagedPlacementDto,
  ValidSlotDto,
} from "../interfaces/schedulingDtos.ts";

const SCHEDULING_URL = `${API_BASE_URL}/scheduling`;

export const fetchValidSlots = async (
  requirementId: number,
): Promise<ValidSlotDto[]> => {
  const response = await fetch(
    `${SCHEDULING_URL}/requirements/${requirementId}/valid-slots`,
  );
  return handleResponse<ValidSlotDto[]>(response);
};

export const createStagedPlacement = async (req: {
  requirementId: number;
  dayId: number;
  startPeriodId: number;
}): Promise<StagedPlacementDto> => {
  const response = await fetch(`${SCHEDULING_URL}/stage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  return handleResponse<StagedPlacementDto>(response);
};

export const deleteStagedPlacement = async (
  placementId: number,
): Promise<void> => {
  const response = await fetch(`${SCHEDULING_URL}/stage/${placementId}`, {
    method: "DELETE",
  });
  await handleResponse<void>(response);
};

export const finalizeSchedule = async (
  timetableId: number,
): Promise<FinalizeScheduleResponse> => {
  const payload: FinalizeScheduleRequest = { timetableId };
  const response = await fetch(`${SCHEDULING_URL}/finalize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<FinalizeScheduleResponse>(response);
};
