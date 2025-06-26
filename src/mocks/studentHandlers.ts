import { delay, http, HttpResponse } from "msw";
import { API_BASE_URL } from "../services/api.helpers.ts";
import { db } from "./db.ts";

export const studentHandlers = [
  http.get(`${API_BASE_URL}/Students`, () => {
    return HttpResponse.json(db.students);
  }),

  http.get(
    `${API_BASE_URL}/Students/:studentId/proposed-enrollments`,
    async ({ params }) => {
      const { studentId } = params;
      const studentProposals =
        db.proposedEnrollments[studentId as string] || [];
      await delay(150);
      return HttpResponse.json(studentProposals);
    },
  ),

  http.get(
    `${API_BASE_URL}/Students/:studentId/available-classes`,
    async () => {
      await delay(250);
      return HttpResponse.json(db.availableClasses);
    },
  ),

  http.post(`${API_BASE_URL}/students/bulk-import`, async ({ request }) => {
    const body = (await request.json()) as { id: number; name: string }[];
    const errors: { csvRow: number; studentId: number; error: string }[] = [];

    const invalidRow = body.find((s) => s.id === 9999);
    if (invalidRow) {
      errors.push({
        csvRow: body.indexOf(invalidRow) + 1,
        studentId: 9999,
        error: "Student ID 9999 does not exist in the database.",
      });
    }

    await delay(800);
    return HttpResponse.json({
      processedCount: body.length - errors.length,
      failedCount: errors.length,
      errors: errors,
    });
  }),

  http.get(`${API_BASE_URL}/timetables/:id/student-audit`, async () => {
    await delay(800);
    return HttpResponse.json(db.studentAudit);
  }),
];
