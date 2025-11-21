import { delay, http, HttpResponse } from "msw";
import { API_BASE_URL } from "../services/api.helpers.ts";
import { db } from "./db.ts";
import type {
  CreateCohortRequest,
  CreateSectionRequest,
  CreateStudentGroupRequest,
} from "../interfaces/academicStructureDtos.ts";
import { CreateTimetableAssignmentRequestDto } from "../interfaces/teacherDtos.ts";
import type { AcademicStructureSyncResultDto } from "../interfaces/syncDtos.ts";
import { getRosterSyncSource } from "./data/mockRosterSyncSource.ts";

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

  // POST :id/academic-structure/sync
  http.post(
    `${TIMETABLE_URL}/:id/academic-structure/sync`,
    async ({ params }) => {
      const timetableId = Number(params.id);
      const seeds = getRosterSyncSource(timetableId);

      if (!seeds) {
        return HttpResponse.json(
          { message: "No roster source data found for timetable." },
          { status: 404 },
        );
      }

      const startedAt = new Date();
      let processedStudents = 0;
      let cohortsCreated = 0;
      let groupsCreated = 0;
      let sectionsCreated = 0;
      const warnings: string[] = [];

      await delay(800);

      for (const cohortSeed of seeds) {
        let cohort = db.cohorts.find(
          (c) => c.name === cohortSeed.name && c.timetableId === timetableId,
        );
        if (!cohort) {
          cohort = {
            id: db.getNextCohortId(),
            name: cohortSeed.name,
            timetableId,
            studentGroups: [],
          };
          db.cohorts.push(cohort);
          cohortsCreated++;
        }

        for (const groupSeed of cohortSeed.groups) {
          let group = cohort.studentGroups.find(
            (g) => g.name === groupSeed.name,
          );
          if (!group) {
            group = {
              id: db.getNextGroupId(),
              name: groupSeed.name,
              sections: [],
            };
            cohort.studentGroups.push(group);
            groupsCreated++;
          }

          for (const sectionSeed of groupSeed.sections) {
            let section = group.sections.find(
              (s) => s.name === sectionSeed.name,
            );
            if (!section) {
              section = {
                id: db.getNextSectionId(),
                name: sectionSeed.name,
                students: [],
              };
              group.sections.push(section);
              sectionsCreated++;
            }

            for (const studentId of sectionSeed.studentIds) {
              const student = db.students.find((s) => s.id === studentId);
              if (!student) {
                warnings.push(`Student ${studentId} not found in mock DB.`);
                continue;
              }

              const alreadyEnrolled = section.students.some(
                (s) => s.id === student.id,
              );
              if (!alreadyEnrolled) {
                section.students.push({ ...student });
                processedStudents++;
              }
            }
          }
        }
      }

      const result: AcademicStructureSyncResultDto = {
        source: "mock-sis",
        startedAt: startedAt.toISOString(),
        completedAt: new Date().toISOString(),
        processedStudents,
        cohortsCreated,
        groupsCreated,
        sectionsCreated,
        message:
          processedStudents === 0 && cohortsCreated === 0
            ? "Roster sync completed. No changes detected."
            : `Roster sync completed with ${processedStudents} student updates.`,
        warnings: warnings.length ? warnings : undefined,
      };

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
  http.get(
    `${ACADEMIC_STRUCTURE_URL}/cohorts/:id/groups-summary`,
    async ({ params }) => {
      const cohortId = Number(params.id);
      await delay(50);
      const cohort = db.cohorts.find((c) => c.id === cohortId);
      const groups = cohort ? cohort.studentGroups.map(toSummary) : [];
      return HttpResponse.json(groups);
    },
  ),

  // Get all Sections for a given Group
  http.get(
    `${ACADEMIC_STRUCTURE_URL}/groups/:id/sections-summary`,
    async ({ params }) => {
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
    },
  ),

  // GET /timetable/:id/assignments
  http.get(`${TIMETABLE_URL}/:id/assignments`, async ({ params }) => {
    const timetableId = Number(params.id);
    const assignments = db.timetableAssignments.filter(
      (a) => a.timetableId === timetableId,
    );
    await delay(200);
    return HttpResponse.json(assignments);
  }),

  // POST /timetable/:id/assignments
  http.post(`${TIMETABLE_URL}/:id/assignments`, async ({ request, params }) => {
    const timetableId = Number(params.id);
    const data = (await request.json()) as CreateTimetableAssignmentRequestDto;

    const teacher = db.teachers.find((t) => t.id === data.teacherId);
    if (!teacher) {
      return HttpResponse.json(
        { message: "Teacher not found" },
        { status: 404 },
      );
    }

    const newAssignment = {
      ...data,
      assignmentId: db.getNextAssignmentId(),
      timetableId: timetableId,
      teacherFullName: teacher.fullName,
    };

    db.timetableAssignments.push(newAssignment);
    await delay(300);
    return HttpResponse.json(newAssignment, { status: 201 });
  }),

  // DELETE /timetable/:id/assignments/:assignmentId
  http.delete(
    `${TIMETABLE_URL}/:id/assignments/:assignmentId`,
    async ({ params }) => {
      const assignmentId = Number(params.assignmentId);
      const initialLength = db.timetableAssignments.length;
      db.timetableAssignments = db.timetableAssignments.filter(
        (a) => a.assignmentId !== assignmentId,
      );

      if (db.timetableAssignments.length === initialLength) {
        return HttpResponse.json(
          { message: "Assignment not found" },
          { status: 404 },
        );
      }

      await delay(400);
      return new HttpResponse(null, { status: 204 });
    },
  ),
];
