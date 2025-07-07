import { delay, http, HttpResponse } from "msw";
import { API_BASE_URL } from "../services/api.helpers.ts";
import { db } from "./db.ts";
import type {
  CourseRequirementDto,
  CreateCourseRequirementRequest,
} from "../interfaces/courseRequirementDtos.ts";
import type {
  BulkImportResultDto,
  BulkRequirementRequestItem,
} from "../interfaces/bulkImportDtos.ts";
import dayjs from "dayjs";

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

  // POST /requirements/bulk-import
  http.post(`${REQ_URL}/bulk-import`, async ({ request }) => {
    const requestItems = (await request.json()) as BulkRequirementRequestItem[];
    const result: BulkImportResultDto = {
      processedCount: 0,
      failedCount: 0,
      errors: [],
      createdRequirements: [],
    };

    // Simulate backend processing
    await delay(800);

    for (const [index, item] of requestItems.entries()) {
      const csvRow = index + 2; // Assuming header is row 1
      let validationError = "";

      // 1. Validate Course
      const course = db.courses.find((c) => c.code === item.courseCode);
      if (!course) {
        validationError = `courseCode '${item.courseCode}' not found.`;
      }

      // 2. Validate Student Group
      let studentGroup = null;
      let parentTimetableId = null;
      if (!validationError) {
        for (const cohort of db.cohorts) {
          const foundGroup = cohort.studentGroups.find(
            (g) => g.name === item.studentGroupName,
          );
          if (foundGroup) {
            studentGroup = foundGroup;
            parentTimetableId = cohort.timetableId;
            break;
          }
        }
        if (!studentGroup) {
          validationError = `studentGroupName '${item.studentGroupName}' not found.`;
        }
      }

      // 3. Validate Teacher (if provided)
      if (!validationError && item.requiredTeacherId) {
        const teacher = db.teachers.find(
          (t) => t.id === item.requiredTeacherId,
        );
        if (!teacher) {
          validationError = `requiredTeacherId '${item.requiredTeacherId}' not found.`;
        }
      }

      // 4. Process result
      if (validationError) {
        result.failedCount++;
        result.errors.push({ csvRow, error: validationError });
      } else {
        // Validation passed, create the new requirement
        const newRequirement: CourseRequirementDto = {
          id: db.getNextRequirementId(),
          timetableId: parentTimetableId!, // We know this exists from validation
          courseId: course!.id,
          courseName: course!.name,
          studentGroupId: studentGroup!.id,
          studentGroupName: studentGroup!.name,
          classType: item.classType,
          length: Number(item.length) || 1,
          frequency: Number(item.frequency) || 1,
          priority: item.priority || "Medium",
          requiredTeacherId: item.requiredTeacherId || null,
          startDate: dayjs().format("YYYY-MM-DD"), // Mocked default
          endDate: dayjs().add(8, "week").format("YYYY-MM-DD"), // Mocked default
          schedulingPreferences: [],
          eligibilitySummary: null, // Pre-flight check will populate this later
        };

        db.requirements.push(newRequirement);
        result.createdRequirements.push(newRequirement);
        result.processedCount++;
      }
    }

    return HttpResponse.json(result, { status: 200 });
  }),
];
