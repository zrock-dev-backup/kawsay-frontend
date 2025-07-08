import { delay, http, HttpResponse } from "msw";
import { API_BASE_URL } from "../services/api.helpers.ts";
import { db } from "./db.ts";

const COURSES_URL = `${API_BASE_URL}/courses`;

export const courseHandlers = [
  // --- Handler for Courses Dropdown ---
  http.get(`${COURSES_URL}/summary`, async () => {
    await delay(50);
    const courseSummary = db.courses.map((c) => ({
      id: c.id,
      name: c.name,
      code: c.code,
    }));
    return HttpResponse.json(courseSummary);
  }),

  // --- Handler for qualified teachers ---
  http.get(
    `${COURSES_URL}/:courseId/qualified-teachers`,
    async ({ params }) => {
      const courseId = Number(params.courseId);
      console.log(
        `[MSW] Fetching qualified teachers for courseId: ${courseId}`,
      );
      await delay(150);

      // Mock logic: All teachers are qualified for all courses for this demo.
      if (courseId) {
        return HttpResponse.json(db.teachers);
      }
      return HttpResponse.json([]);
    },
  ),
];
