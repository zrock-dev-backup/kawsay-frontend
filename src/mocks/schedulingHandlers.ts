import { delay, http, HttpResponse } from "msw";
import { API_BASE_URL } from "../services/api.helpers.ts";
import type {
  FinalizeScheduleRequest,
  FinalizeScheduleResponse,
  StagedPlacementDto,
  ValidSlotDto,
} from "../interfaces/schedulingDtos.ts";
import { db } from "./db.ts";

let stagedPlacements: StagedPlacementDto[] = [];
let nextPlacementId = 1;

const SCHEDULING_URL = `${API_BASE_URL}/scheduling`;

export const schedulingHandlers = [
  // This mock simulates fetching valid slots for a given requirement
  http.get(
    `${SCHEDULING_URL}/requirements/:id/valid-slots`,
    async ({ params }) => {
      console.log(`[MSW] Fetching valid slots for requirementId: ${params.id}`);
      await delay(400);

      // Mock logic: Return a few ideal and a few viable slots for demonstration
      return HttpResponse.json([
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
      ] as ValidSlotDto[]);
    },
  ),

  // This mock simulates creating a new staged placement
  http.post(`${SCHEDULING_URL}/stage`, async ({ request }) => {
    const req = (await request.json()) as {
      requirementId: number;
      dayId: number;
      startPeriodId: number;
    };

    const sourceReq = db.requirements.find((r) => r.id === req.requirementId);
    if (!sourceReq) {
      return HttpResponse.json(
        { message: "Source requirement not found!" },
        { status: 404 },
      );
    }

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

    await delay(200);
    return HttpResponse.json(newPlacement);
  }),

  // This mock simulates deleting a staged placement
  http.delete(`${SCHEDULING_URL}/stage/:id`, async ({ params }) => {
    const placementId = Number(params.id);
    stagedPlacements = stagedPlacements.filter((p) => p.id !== placementId);
    await delay(200);
    return new HttpResponse(null, { status: 204 });
  }),

  // This mock simulates finalizing the schedule
  http.post(`${SCHEDULING_URL}/finalize`, async ({ request }) => {
    const req = (await request.json()) as FinalizeScheduleRequest;
    console.log(`[MSW] Finalizing schedule for timetable ${req.timetableId}`);
    await delay(1500);

    const count = stagedPlacements.length;
    // Simulate side effects on the backend
    db.studentAudit.forEach((student) => {
      if (student.status !== "Enrolled") {
        student.status = "ReadyToEnroll";
        student.lastUpdated = new Date().toISOString();
      }
    });
    stagedPlacements = []; // Clear the staging area

    return HttpResponse.json({
      message: `Successfully finalized schedule and created ${count} new classes.`,
      classesCreated: count,
    } as FinalizeScheduleResponse);
  }),
];
