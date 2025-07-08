import { http, HttpResponse } from "msw";
import { getMockCohorts } from "./data/mockAcademicStructure";
import { getMockCourses, getMockTeachers } from "./data/mockCoursesAndTeachers";
import type { CourseSummaryDto, SummaryDto } from "../interfaces/formDataDtos";
import type { TeacherDto } from "../interfaces/teacherDtos";

// TODO: use correct api base
const API_BASE = "/api";

export const formDataHandlers = [
  // Handler for fetching course summaries, used in CourseRequirementForm
  http.get(`${API_BASE}/courses/summary`, () => {
    const courses = getMockCourses();
    const summary: CourseSummaryDto[] = courses.map((c) => ({
      id: c.id,
      name: c.name,
      code: c.code,
    }));
    return HttpResponse.json(summary);
  }),

  // Handler for fetching cohort summaries for a specific timetable
  http.get(
    `${API_BASE}/timetables/:timetableId/cohorts/summary`,
    ({ params }) => {
      const { timetableId } = params;
      const cohorts = getMockCohorts().filter(
        (c) => c.timetableId === Number(timetableId),
      );
      const summary: SummaryDto[] = cohorts.map((c) => ({
        id: c.id,
        name: c.name,
      }));
      return HttpResponse.json(summary);
    },
  ),

  // Handler for fetching group summaries for a specific cohort
  http.get(`${API_BASE}/cohorts/:cohortId/groups/summary`, ({ params }) => {
    const { cohortId } = params;
    const cohort = getMockCohorts().find((c) => c.id === Number(cohortId));
    if (!cohort) {
      return new HttpResponse(null, { status: 404 });
    }
    const summary: SummaryDto[] = cohort.studentGroups.map((g) => ({
      id: g.id,
      name: g.name,
    }));
    return HttpResponse.json(summary);
  }),

  // Handler for fetching section summaries for a specific group
  http.get(`${API_BASE}/groups/:groupId/sections/summary`, ({ params }) => {
    const { groupId } = params;
    const allCohorts = getMockCohorts();
    let group;
    for (const cohort of allCohorts) {
      const foundGroup = cohort.studentGroups.find(
        (g) => g.id === Number(groupId),
      );
      if (foundGroup) {
        group = foundGroup;
        break;
      }
    }

    if (!group) {
      return new HttpResponse(null, { status: 404 });
    }
    const summary: SummaryDto[] = group.sections.map((s) => ({
      id: s.id,
      name: s.name,
    }));
    return HttpResponse.json(summary);
  }),

  // Handler for fetching teachers qualified for a specific course
  http.get(`${API_BASE}/courses/:courseId/qualified-teachers`, ({ params }) => {
    const { courseId } = params;
    const allTeachers = getMockTeachers();
    const qualified = allTeachers.filter((teacher) =>
      teacher.qualifications.some((q) => q.id === Number(courseId)),
    );
    return HttpResponse.json<TeacherDto[]>(qualified);
  }),
];
