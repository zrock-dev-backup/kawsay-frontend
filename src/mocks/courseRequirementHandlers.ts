import { delay, http, HttpResponse } from "msw";
import { API_BASE_URL } from "../services/api.helpers.ts";
import { db } from "./db.ts";
import type {
  CourseRequirementDto,
  CreateCourseRequirementRequest,
} from "../interfaces/courseRequirementDtos.ts";
import type { CourseRequirementSyncResultDto } from "../interfaces/syncDtos.ts";
import dayjs from "dayjs";
import { getRequirementSyncSeeds } from "./data/mockRequirementSyncSource.ts";

const REQ_URL = `${API_BASE_URL}/requirements`;

export const courseRequirementHandlers = [
  // GET /requirements?timetableId=:id
  http.get(REQ_URL, async ({ request }) => {
    const url = new URL(request.url);
    const timetableId = url.searchParams.get("timetableId");

    if (!timetableId) {
      return HttpResponse.json(db.requirements, { status: 200 });
    }

    const filtered = db.requirements.filter(
      (r) => r.timetableId === Number(timetableId),
    );
    await delay(150);
    return HttpResponse.json(filtered);
  }),

  // GET /requirements/:id
  http.get(`${REQ_URL}/:id`, async ({ params }) => {
    const { id } = params;
    const requirement = db.requirements.find((r) => r.id === Number(id));
    if (!requirement) {
      return new HttpResponse(null, { status: 404 });
    }
    await delay(100);
    return HttpResponse.json(requirement);
  }),

  http.post(`${REQ_URL}/preflight-check`, async ({ request }) => {
    const data = (await request.json()) as CreateCourseRequirementRequest;
    await delay(400); // Simulate network latency for validation

    // Mock Logic: If the requirement is for "Group B" (ID 102), return issues.
    // Otherwise, return a clean bill of health.
    if (data.studentGroupId === 102) {
      console.log(
        `[MSW] Pre-flight check for Group ID ${data.studentGroupId} found 2 issues.`,
      );
      return HttpResponse.json({
        summary: { eligible: 48, total: 50, issues: 2 },
        ineligibleStudentIds: [1002, 1025], // Mocked student IDs with issues
      });
    }

    console.log(
      `[MSW] Pre-flight check for Group ID ${data.studentGroupId} found 0 issues.`,
    );
    return HttpResponse.json({
      summary: { eligible: 50, total: 50, issues: 0 },
      ineligibleStudentIds: [],
    });
  }),

  // POST /requirements
  http.post(REQ_URL, async ({ request }) => {
    // The request can now optionally include a list of students to flag.
    const data = (await request.json()) as CreateCourseRequirementRequest & {
      ineligibleStudentIdsToFlag?: number[];
    };

    const newRequirement: CourseRequirementDto = {
      id: db.getNextRequirementId(),
      timetableId: data.timetableId,
      courseId: data.courseId,
      studentGroupId: data.studentGroupId,
      classType: data.classType,
      length: data.length,
      frequency: data.frequency,
      priority: data.priority,
      requiredTeacherId: data.requiredTeacherId,
      startDate: dayjs(data.startDate).format("YYYY-MM-DD"),
      endDate: dayjs(data.endDate).format("YYYY-MM-DD"),
      schedulingPreferences: data.schedulingPreferences,
      // Mocked data for display
      courseName: `Course ID: ${data.courseId}`,
      studentGroupName: `Group ID: ${data.studentGroupId}`,
      // The summary is now derived from the pre-flight check results
      eligibilitySummary: null,
    };

    // Simulate backend logic based on the "Informed Deferral" contract
    if (
      data.ineligibleStudentIdsToFlag &&
      data.ineligibleStudentIdsToFlag.length > 0
    ) {
      const issues = data.ineligibleStudentIdsToFlag.length;
      const total = 50; // Mocked total
      console.log(
        `[MSW] Creating requirement and quarantining ${issues} students for later audit.`,
      );
      newRequirement.eligibilitySummary = {
        eligible: total - issues,
        total: total,
        issues: issues,
      };
    } else {
      console.log(`[MSW] Creating requirement with no eligibility issues.`);
      newRequirement.eligibilitySummary = {
        eligible: 50, // Mocked total
        total: 50,
        issues: 0,
      };
    }

    db.requirements.push(newRequirement);
    await delay(300);
    return HttpResponse.json(newRequirement, { status: 201 });
  }),

  // PUT /requirements/:id
  http.put(`${REQ_URL}/:id`, async ({ params, request }) => {
    const { id } = params;
    const data =
      (await request.json()) as Partial<CreateCourseRequirementRequest>;
    const reqIndex = db.requirements.findIndex((r) => r.id === Number(id));

    if (reqIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    const updatedRequirement = {
      ...db.requirements[reqIndex],
      ...data,
    };
    db.requirements[reqIndex] = updatedRequirement;

    await delay(250);
    return HttpResponse.json(updatedRequirement);
  }),

  // DELETE /requirements/:id
  http.delete(`${REQ_URL}/:id`, async ({ params }) => {
    const { id } = params;
    const reqIndex = db.requirements.findIndex((r) => r.id === Number(id));

    if (reqIndex === -1) {
      // Non-blocking, just log it server-side
      console.warn(`[MSW] Requirement with id ${id} not found for deletion.`);
    } else {
      db.requirements.splice(reqIndex, 1);
    }

    await delay(200);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`${REQ_URL}/:id/run-preflight-check`, async ({ params }) => {
    const { id } = params;
    const reqIndex = db.requirements.findIndex((r) => r.id === Number(id));

    if (reqIndex !== -1) {
      db.requirements[reqIndex].eligibilitySummary = {
        eligible: 47,
        total: 50,
        issues: 3,
      };
    }
    await delay(1200);
    return new HttpResponse(null, { status: 202 });
  }),

  http.get(`${REQ_URL}/:id/issues`, async ({ params }) => {
    const { id } = params;
    const issues = db.requirementIssues[id as string] || [];
    await delay(400);
    return HttpResponse.json(issues);
  }),

  // POST /requirements/:timetableId/sync
  http.post(`${REQ_URL}/:timetableId/sync`, async ({ params }) => {
    const timetableId = Number(params.timetableId);
    const seeds = getRequirementSyncSeeds(timetableId);

    if (!seeds) {
      return HttpResponse.json(
        { message: "No requirement source data found for timetable." },
        { status: 404 },
      );
    }

    const startedAt = new Date();
    let requirementsCreated = 0;
    let requirementsUpdated = 0;
    let skipped = 0;
    const warnings: string[] = [];

    await delay(700);

    for (const seed of seeds) {
      const course = db.courses.find((c) => c.code === seed.courseCode);
      if (!course) {
        warnings.push(`Course ${seed.courseCode} not found.`);
        skipped++;
        continue;
      }

      let studentGroupId: number | null = null;
      let studentGroupName: string | null = null;

      for (const cohort of db.cohorts) {
        const group = cohort.studentGroups.find(
          (g) => g.name === seed.studentGroupName,
        );
        if (group && cohort.timetableId === timetableId) {
          studentGroupId = group.id;
          studentGroupName = group.name;
          break;
        }
      }

      if (!studentGroupId || !studentGroupName) {
        warnings.push(
          `Student group '${seed.studentGroupName}' not found for timetable ${timetableId}.`,
        );
        skipped++;
        continue;
      }

      const existingRequirement = db.requirements.find(
        (req) =>
          req.timetableId === timetableId &&
          req.courseId === course.id &&
          req.studentGroupId === studentGroupId,
      );

      const baseDates = {
        start: dayjs().add(1, "week").format("YYYY-MM-DD"),
        end: dayjs().add(9, "week").format("YYYY-MM-DD"),
      };

      if (existingRequirement) {
        existingRequirement.classType = seed.classType;
        existingRequirement.length = seed.length;
        existingRequirement.frequency = seed.frequency;
        existingRequirement.priority = seed.priority;
        existingRequirement.requiredTeacherId = seed.requiredTeacherId ?? null;
        existingRequirement.startDate = baseDates.start;
        existingRequirement.endDate = baseDates.end;
        existingRequirement.eligibilitySummary = null;
        requirementsUpdated++;
      } else {
        const newRequirement: CourseRequirementDto = {
          id: db.getNextRequirementId(),
          timetableId,
          courseId: course.id,
          courseName: course.name,
          studentGroupId,
          studentGroupName,
          studentSectionId: null,
          studentSectionName: null,
          classType: seed.classType,
          length: seed.length,
          frequency: seed.frequency,
          priority: seed.priority,
          requiredTeacherId: seed.requiredTeacherId ?? null,
          startDate: baseDates.start,
          endDate: baseDates.end,
          schedulingPreferences: [],
          eligibilitySummary: null,
        };
        db.requirements.push(newRequirement);
        requirementsCreated++;
      }
    }

    const result: CourseRequirementSyncResultDto = {
      source: "mock-rules-engine",
      startedAt: startedAt.toISOString(),
      completedAt: new Date().toISOString(),
      requirementsCreated,
      requirementsUpdated,
      skipped,
      message:
        requirementsCreated === 0 && requirementsUpdated === 0
          ? "Requirement sync completed. No changes detected."
          : `Requirement sync created ${requirementsCreated} and updated ${requirementsUpdated} record(s).`,
      warnings: warnings.length ? warnings : undefined,
    };

    return HttpResponse.json(result, { status: 200 });
  }),
];
