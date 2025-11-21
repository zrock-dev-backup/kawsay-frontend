import { delay, http, HttpResponse } from "msw";
import { API_BASE_URL } from "../services/api.helpers.ts";
import { db } from "./db.ts";
import type {
  EnrollmentRequest,
  EnrollmentResponse,
} from "../services/enrollmentApi.ts";

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
    async ({ request }) => {
      const url = new URL(request.url);
      const timetableId = url.searchParams.get("timetableId");
      const filteredClasses = db.availableClasses.filter((cls) =>
        timetableId ? cls.timetableId === Number(timetableId) : true,
      );
      await delay(250);
      return HttpResponse.json(filteredClasses);
    },
  ),

  http.post(`${API_BASE_URL}/enrollments`, async ({ request }) => {
    const payload = (await request.json()) as EnrollmentRequest;
    const classRecord = db.availableClasses.find(
      (cls) => cls.id === payload.classId,
    );

    if (!classRecord) {
      return HttpResponse.json(
        { message: "Class not found for enrollment." },
        { status: 404 },
      );
    }

    if (
      !payload.force &&
      classRecord.currentEnrollment >= classRecord.capacity
    ) {
      return HttpResponse.json(
        { message: "Class is already at capacity." },
        { status: 400 },
      );
    }

    classRecord.currentEnrollment = Math.min(
      classRecord.capacity,
      classRecord.currentEnrollment + 1,
    );

    const newEnrollment: EnrollmentResponse = {
      id: db.getNextEnrollmentId(),
      studentId: payload.studentId,
      classId: payload.classId,
      enrollmentDate: new Date().toISOString(),
    };

    db.enrollments.push(newEnrollment);
    await delay(300);
    return HttpResponse.json(newEnrollment, { status: 201 });
  }),

  http.get(`${API_BASE_URL}/timetables/:id/student-audit`, async () => {
    await delay(800);
    return HttpResponse.json(db.studentAudit);
  }),
];
