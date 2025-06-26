import { delay, http, HttpResponse } from "msw";
import { API_BASE_URL } from "../services/api.helpers.ts";
import { db } from "./db.ts";
import type {
  CreateCohortRequest,
  CreateSectionRequest,
  CreateStudentGroupRequest,
} from "../interfaces/academicStructureDtos.ts";

const ACADEMIC_STRUCTURE_URL = `${API_BASE_URL}/academic-structure`;
const TIMETABLE_URL = `${API_BASE_URL}/timetable`;

export const academicStructureHandlers = [
  // GET /timetable/:id/cohorts
  http.get(`${TIMETABLE_URL}/:id/cohorts`, async ({ params }) => {
    const timetableId = Number(params.id);
    const cohorts = db.cohorts.filter((c) => c.timetableId === timetableId);
    await delay(200);
    return HttpResponse.json(cohorts);
  }),

  // POST /academic-structure/cohorts
  http.post(`${ACADEMIC_STRUCTURE_URL}/cohorts`, async ({ request }) => {
    const data = (await request.json()) as CreateCohortRequest;
    const newCohort = {
      id: db.getNextCohortId(),
      name: data.name,
      timetableId: data.timetableId,
      studentGroups: [],
    };
    db.cohorts.push(newCohort);
    await delay(300);
    return HttpResponse.json(newCohort, { status: 201 });
  }),

  // POST /academic-structure/groups
  http.post(`${ACADEMIC_STRUCTURE_URL}/groups`, async ({ request }) => {
    const data = (await request.json()) as CreateStudentGroupRequest;
    const parentCohort = db.cohorts.find((c) => c.id === data.cohortId);

    if (!parentCohort) {
      return HttpResponse.json(
        { message: "Cohort not found" },
        { status: 404 },
      );
    }

    const newGroup = {
      id: db.getNextGroupId(),
      name: data.name,
      sections: [],
    };
    parentCohort.studentGroups.push(newGroup);

    await delay(300);
    return HttpResponse.json(newGroup, { status: 201 });
  }),

  // POST /academic-structure/sections
  http.post(`${ACADEMIC_STRUCTURE_URL}/sections`, async ({ request }) => {
    const data = (await request.json()) as CreateSectionRequest;
    let parentGroup = null;

    for (const cohort of db.cohorts) {
      const foundGroup = cohort.studentGroups.find(
        (g) => g.id === data.studentGroupId,
      );
      if (foundGroup) {
        parentGroup = foundGroup;
        break;
      }
    }

    if (!parentGroup) {
      return HttpResponse.json(
        { message: "Student Group not found" },
        { status: 404 },
      );
    }

    const newSection = {
      id: db.getNextSectionId(),
      name: data.name,
      students: [],
    };
    parentGroup.sections.push(newSection);

    await delay(300);
    return HttpResponse.json(newSection, { status: 201 });
  }),
];
