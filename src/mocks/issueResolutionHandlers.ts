import { delay, http, HttpResponse } from "msw";
import { API_BASE_URL } from "../services/api.helpers.ts";
import { db } from "./db.ts";
import { ResolveIssueRequestDto } from "../interfaces/issueDtos.ts";

const STUDENT_URL = `${API_BASE_URL}/students`;

export const issueResolutionHandlers = [
  // GET /students/:id/issues
  http.get(`${STUDENT_URL}/:id/issues`, async ({ params }) => {
    const studentId = params.id as string;
    const issues = db.issueDetails[studentId] || [];

    await delay(500);
    return HttpResponse.json(issues);
  }),

  // POST /students/:id/resolve-issue
  http.post(`${STUDENT_URL}/:id/resolve-issue`, async ({ params, request }) => {
    const studentId = Number(params.id);
    const body = (await request.json()) as ResolveIssueRequestDto;

    console.log(`[MSW] Received resolution for student ${studentId}:`, body);

    const studentInAudit = db.studentAudit.find(
      (s) => s.studentId === studentId,
    );
    if (!studentInAudit) {
      return HttpResponse.json(
        { message: `Student ${studentId} not found in audit.` },
        { status: 404 },
      );
    }

    // Simulate removing the resolved issue from our mock DB.
    if (db.issueDetails[studentId.toString()]) {
      db.issueDetails[studentId.toString()] = db.issueDetails[
        studentId.toString()
      ].filter((issue) => issue.issueId !== body.issueId);
    }

    // If all issues are resolved for the student, update their status.
    if (
      !db.issueDetails[studentId.toString()] ||
      db.issueDetails[studentId.toString()].length === 0
    ) {
      studentInAudit.status = "ReadyToEnroll";
      studentInAudit.issues = undefined;
      studentInAudit.lastUpdated = new Date().toISOString();
      console.log(
        `[MSW] Student ${studentId} status updated to ReadyToEnroll.`,
      );
    }

    await delay(800);
    return new HttpResponse(null, { status: 204 });
  }),
];
