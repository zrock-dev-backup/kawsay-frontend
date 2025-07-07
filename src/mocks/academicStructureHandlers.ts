import { delay, http, HttpResponse } from "msw";
import { API_BASE_URL } from "../services/api.helpers.ts";
import { db } from "./db.ts";
import type {
  CreateCohortRequest,
  CreateSectionRequest,
  CreateStudentGroupRequest,
} from "../interfaces/academicStructureDtos.ts";
import {
  BulkStructureRequestItem,
  StructureBulkImportResultDto,
} from "../interfaces/bulkImportDtos.ts";

const ACADEMIC_STRUCTURE_URL = `${API_BASE_URL}/academic-structure`;
const TIMETABLE_URL = `${API_BASE_URL}/timetable`;

const toSummary = (item: { id: number; name: string }) => ({
  id: item.id,
  name: item.name,
});

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

  // POST :id/academic-structure/bulk-import
  http.post(
    `${TIMETABLE_URL}/:id/academic-structure/bulk-import`,
    async ({ params, request }) => {
      const timetableId = Number(params.id);
      const requestItems = (await request.json()) as BulkStructureRequestItem[];

      const result: StructureBulkImportResultDto = {
        processedCount: 0,
        failedCount: 0,
        errors: [],
        summary: {
          cohorts: { created: [], found: [] },
          groups: { created: [], found: [] },
          sections: { created: [], found: [] },
        },
      };

      // Use Sets to avoid duplicate names in the summary report
      const createdCohorts = new Set<string>();
      const foundCohorts = new Set<string>();
      const createdGroups = new Set<string>();
      const foundGroups = new Set<string>();
      const createdSections = new Set<string>();
      const foundSections = new Set<string>();

      await delay(1200); // Simulate processing time

      for (const [index, item] of requestItems.entries()) {
        const csvRow = index + 2; // Assuming header row
        if (!item.studentId) {
          result.failedCount++;
          result.errors.push({
            csvRow,
            error: `Invalid or missing studentId.`,
          });
          continue; // Skip to the next item
        }

        // --- Find or Create Cohort ---
        let cohort = db.cohorts.find(
          (c) => c.name === item.cohortName && c.timetableId === timetableId,
        );
        if (!cohort) {
          cohort = {
            id: db.getNextCohortId(),
            name: item.cohortName,
            timetableId: timetableId,
            studentGroups: [],
          };
          db.cohorts.push(cohort);
          createdCohorts.add(cohort.name);
        } else {
          foundCohorts.add(cohort.name);
        }

        // --- Find or Create Student Group ---
        let group = cohort.studentGroups.find((g) => g.name === item.groupName);
        if (!group) {
          group = {
            id: db.getNextGroupId(),
            name: item.groupName,
            sections: [],
          };
          cohort.studentGroups.push(group);
          createdGroups.add(group.name);
        } else {
          foundGroups.add(group.name);
        }

        // --- Find or Create Section ---
        let section = group.sections.find((s) => s.name === item.sectionName);
        if (!section) {
          section = {
            id: db.getNextSectionId(),
            name: item.sectionName,
            students: [],
          };
          group.sections.push(section);
          createdSections.add(section.name);
        } else {
          foundSections.add(section.name);
        }

        // --- Assign Student ---
        const studentExists = section.students.some(
          (s) => s.id === item.studentId,
        );
        if (!studentExists) {
          section.students.push({
            id: item.studentId,
            name: item.studentName,
            // Mocked defaults for other StudentDto fields
            currentCourseLoad: 0,
            standing: "GoodStanding",
            proposedEnrollmentCount: 0,
          });
        }
        result.processedCount++;
      }

      // Populate summary from Sets
      result.summary.cohorts.created = Array.from(createdCohorts);
      result.summary.cohorts.found = Array.from(foundCohorts);
      result.summary.groups.created = Array.from(createdGroups);
      result.summary.groups.found = Array.from(foundGroups);
      result.summary.sections.created = Array.from(createdSections);
      result.summary.sections.found = Array.from(foundSections);

      return HttpResponse.json(result, { status: 200 });
    },
  ),

  // Get all Cohorts for a given Timetable
  http.get(`${TIMETABLE_URL}/:id/cohorts-summary`, async ({ params }) => {
    const timetableId = Number(params.id);
    await delay(50);
    const cohorts = db.cohorts
        .filter((c) => c.timetableId === timetableId)
        .map(toSummary);
    return HttpResponse.json(cohorts);
  }),

  // Get all Groups for a given Cohort
  http.get(`${ACADEMIC_STRUCTURE_URL}/cohorts/:id/groups-summary`, async ({ params }) => {
    const cohortId = Number(params.id);
    await delay(50);
    const cohort = db.cohorts.find((c) => c.id === cohortId);
    const groups = cohort ? cohort.studentGroups.map(toSummary) : [];
    return HttpResponse.json(groups);
  }),

  // Get all Sections for a given Group
  http.get(`${ACADEMIC_STRUCTURE_URL}/groups/:id/sections-summary`, async ({ params }) => {
    const groupId = Number(params.id);
    await delay(50);
    let sections: { id: number; name: string }[] = [];
    for (const cohort of db.cohorts) {
      const group = cohort.studentGroups.find((g) => g.id === groupId);
      if (group) {
        sections = group.sections.map(toSummary);
        break;
      }
    }
    return HttpResponse.json(sections);
  }),
];
