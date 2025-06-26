import { delay, http, HttpResponse } from "msw";
import { API_BASE_URL } from "../services/api.helpers.ts";
import { db } from "./db.ts"; // Import our centralized database
import type { CreateCourseRequirementRequest, CourseRequirementDto } from "../interfaces/courseRequirementDtos.ts";

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
      (r) => r.timetableId === Number(timetableId)
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

  // POST /requirements
  http.post(REQ_URL, async ({ request }) => {
    const data = (await request.json()) as CreateCourseRequirementRequest;
    const newRequirement: CourseRequirementDto = {
      ...data,
      id: db.getNextRequirementId(),
      courseName: `Course ID: ${data.courseId}`, // Mocked data
      studentGroupName: `Group ID: ${data.studentGroupId}`, // Mocked data
      eligibilitySummary: null,
    };
    db.requirements.push(newRequirement);
    await delay(300);
    return HttpResponse.json(newRequirement, { status: 201 });
  }),

  // PUT /requirements/:id
  http.put(`${REQ_URL}/:id`, async ({ params, request }) => {
    const { id } = params;
    const data = (await request.json()) as Partial<CreateCourseRequirementRequest>;
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
];
