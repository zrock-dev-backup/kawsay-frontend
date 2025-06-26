import { delay, http, HttpResponse } from "msw";
import { API_BASE_URL } from "../services/api.helpers.ts";
import { db } from "./db.ts";
import type { BulkEnrollmentRequest } from "../interfaces/auditDtos.ts";

const TIMETABLE_URL = `${API_BASE_URL}/timetables`;
const STUDENT_URL = `${API_BASE_URL}/students`;

export const studentAuditHandlers = [
  // GET /timetables/:id/student-audit
  http.get(`${TIMETABLE_URL}/:id/student-audit`, async () => {
    await delay(600);
    return HttpResponse.json(db.studentAudit);
  }),

  // POST /timetables/:id/bulk-enroll
  http.post(`${TIMETABLE_URL}/:id/bulk-enroll`, async ({ request }) => {
    const { studentIds } = (await request.json()) as BulkEnrollmentRequest;

    if (!studentIds || studentIds.length === 0) {
      return HttpResponse.json(
        { message: "studentIds are required" },
        { status: 400 },
      );
    }

    db.studentAudit.forEach((student) => {
      if (studentIds.includes(student.studentId)) {
        if (student.status === "ReadyToEnroll") {
          student.status = "Enrolled";
          student.lastUpdated = new Date().toISOString();
          student.issues = undefined;
        }
      }
    });

    await delay(1200);
    return new HttpResponse(null, { status: 204 });
  }),

  // POST /students/:id/resolve-issues
  http.post(`${STUDENT_URL}/:id/resolve-issues`, async ({ params }) => {
    const studentId = Number(params.id);
    const student = db.studentAudit.find((s) => s.studentId === studentId);

    if (!student) {
      return new HttpResponse(null, { status: 404 });
    }

    if (student.status === "ActionRequired") {
      student.status = "ReadyToEnroll";
      student.lastUpdated = new Date().toISOString();
      student.issues = undefined;
    }

    await delay(800);
    return new HttpResponse(null, { status: 204 });
  }),
];
