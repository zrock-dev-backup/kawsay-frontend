import type {
  FinalizeScheduleResponse,
  StagedPlacementDto,
  ValidSlotDto,
} from "../interfaces/schedulingDtos.ts";
import { useCourseRequirementStore } from "../stores/useCourseRequirementStore.ts";

// --- MOCKED DATABASE ---
let stagedPlacements: StagedPlacementDto[] = [];
let nextPlacementId = 1;
// --- END MOCKED DATABASE ---

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchValidSlots = async (
  requirementId: number,
): Promise<ValidSlotDto[]> => {
  console.log(
    `[Mock API] Fetching valid slots for requirementId: ${requirementId}`,
  );
  await sleep(400);

  // Mock logic: Return a few ideal and a few viable slots for demonstration
  return [
    {
      dayId: 1,
      startPeriodId: 2,
      satisfaction: {
        score: 100,
        details: [
          {
            constraint: "Teacher Preference",
            isMet: true,
            message: "Matches ideal time",
          },
        ],
      },
    },
    {
      dayId: 1,
      startPeriodId: 3,
      satisfaction: {
        score: 100,
        details: [
          {
            constraint: "Teacher Preference",
            isMet: true,
            message: "Matches ideal time",
          },
        ],
      },
    },
    {
      dayId: 3,
      startPeriodId: 5,
      satisfaction: {
        score: 75,
        details: [
          {
            constraint: "Teacher Preference",
            isMet: false,
            message: "Does not match ideal time",
          },
        ],
      },
    },
    {
      dayId: 4,
      startPeriodId: 1,
      satisfaction: {
        score: 75,
        details: [
          {
            constraint: "Teacher Preference",
            isMet: false,
            message: "Does not match ideal time",
          },
        ],
      },
    },
  ];
};

export const createStagedPlacement = async (req: {
  requirementId: number;
  dayId: number;
  startPeriodId: number;
}): Promise<StagedPlacementDto> => {
  console.log("[Mock API] Staging placement:", req);
  await sleep(200);

  const allRequirements = useCourseRequirementStore.getState().requirements;
  const sourceReq = allRequirements.find((r) => r.id === req.requirementId);
  if (!sourceReq) throw new Error("Source requirement not found!");

  const newPlacement: StagedPlacementDto = {
    id: nextPlacementId++,
    courseRequirementId: req.requirementId,
    courseName: sourceReq.courseName,
    courseCode: `C${sourceReq.courseId}`, // Placeholder
    dayId: req.dayId,
    startPeriodId: req.startPeriodId,
    length: sourceReq.length,
  };
  stagedPlacements.push(newPlacement);
  return newPlacement;
};

export const deleteStagedPlacement = async (
  placementId: number,
): Promise<void> => {
  console.log(`[Mock API] Deleting staged placement ${placementId}`);
  await sleep(200);
  stagedPlacements = stagedPlacements.filter((p) => p.id !== placementId);
};

export const finalizeSchedule = async (
  timetableId: number,
): Promise<FinalizeScheduleResponse> => {
  console.log(`[Mock API] Finalizing schedule for timetable ${timetableId}`);
  await sleep(1500);
  const count = stagedPlacements.length;
  stagedPlacements = []; // Clear the staging area
  return {
    message: `Successfully finalized schedule and created ${count} classes.`,
    classesCreated: count,
  };
};
