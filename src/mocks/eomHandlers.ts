import { delay, http, HttpResponse } from "msw";
import { API_BASE_URL } from "../services/api.helpers.ts";
import { db } from "./db.ts";

export const eomHandlers = [
  http.post(`${API_BASE_URL}/eom/:timetableId/sync-grades`, async ({ params }) => {
    const timetableId = Number(params.timetableId);
    await delay(900);

    const report = db.eomReports[timetableId];
    if (!report) {
      return HttpResponse.json(
        { message: "No grade sync data available for this module." },
        { status: 404 },
      );
    }

    const syncedAt = new Date().toISOString();
    const responseBody = { ...report, syncedAt };
    db.eomReports[timetableId] = responseBody;

    return HttpResponse.json(responseBody);
  }),

  http.post(
    `${API_BASE_URL}/eom/:timetableId/prepare-enrollments`,
    async ({ params, request }) => {
      const timetableId = Number(params.timetableId);
      const body = (await request.json()) as {
        destinationTimetableId?: string | number;
      };

      if (!body?.destinationTimetableId) {
        return HttpResponse.json(
          { message: "destinationTimetableId is required." },
          { status: 400 },
        );
      }

      const latestSync = db.eomReports[timetableId];
      const baseCount =
        latestSync?.retakeDemand.reduce(
          (total, course) => total + course.studentCount,
          0,
        ) ?? 18;

      const result = {
        message: `Successfully prepared ${baseCount} enrollment proposals for Module ${body.destinationTimetableId}.`,
        proposalsCreated: baseCount,
        preparedAt: new Date().toISOString(),
      };

      db.enrollmentProposalHistory[timetableId] = [
        ...(db.enrollmentProposalHistory[timetableId] ?? []),
        result,
      ];

      await delay(1200);
      return HttpResponse.json(result);
    },
  ),
];
