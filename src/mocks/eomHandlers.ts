import { delay, http, HttpResponse } from "msw";
import { API_BASE_URL } from "../services/api.helpers.ts";

export const eomHandlers = [
  http.post(`${API_BASE_URL}/eom/:timetableId/ingest-grades`, async () => {
    await delay(1000);
    return HttpResponse.json({
      processedCount: 150,
      failedCount: 0,
      errors: [],
      retakeDemand: [
        { courseCode: "DB303", studentCount: 15 },
        { courseCode: "PHY101", studentCount: 8 },
      ],
      advancingCohorts: [
        { cohortName: "Fall 2024 - Group A", studentCount: 45 },
        { cohortName: "Fall 2024 - Group B", studentCount: 42 },
      ],
    });
  }),

  http.post(`${API_BASE_URL}/eom/:timetableId/prepare-enrollments`, async ({ request }) => {
    const body = (await request.json()) as { destinationTimetableId: string };
    await delay(1500);
    return HttpResponse.json({
      message: `Successfully prepared 23 enrollment proposals for Module ${body.destinationTimetableId}.`,
      proposalsCreated: 23,
    });
  }),
];
