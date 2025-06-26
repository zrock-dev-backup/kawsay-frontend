import { delay, http, HttpResponse } from "msw";
import { API_BASE_URL } from "../services/api.helpers.ts";
import { db } from "./db.ts";
import type { CreateTimetableRequest } from "../interfaces/timetableDtos.ts";

const TIMETABLE_URL = `${API_BASE_URL}/timetable`;

export const timetableHandlers = [
  // Existing handlers would go here, e.g., for creating a timetable
  http.post(TIMETABLE_URL, async ({ request }) => {
    const data = (await request.json()) as CreateTimetableRequest;
    // This is a simplified mock for timetable creation
    const newTimetable = {
      id: db.getNextTimetableId(),
      name: data.name,
      status: "Draft",
      startDate: data.startDate,
      endDate: data.endDate,
      days: data.days.map((d, i) => ({ id: i + 1, name: d })),
      periods: data.periods.map((p, i) => ({
        id: i + 1,
        start: p.start,
        end: p.end,
      })),
    };
    db.timetables.push(newTimetable);
    await delay(300);
    return HttpResponse.json(newTimetable, { status: 201 });
  }),

  // GET all timetables
  http.get(`${API_BASE_URL}/timetables`, async () => {
    return HttpResponse.json(db.timetables);
  }),

  // GET timetable by ID
  http.get(`${TIMETABLE_URL}/:id`, async ({ params }) => {
    const timetable = db.timetables.find((t) => t.id === Number(params.id));
    if (!timetable) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(timetable);
  }),

  // NEW HANDLER for publishing
  http.post(`${TIMETABLE_URL}/:id/publish`, async ({ params }) => {
    const timetableId = Number(params.id);
    const timetable = db.timetables.find((t) => t.id === timetableId);

    if (!timetable) {
      return new HttpResponse(null, { status: 404 });
    }

    // This is the core logic: update the status
    timetable.status = "Published";

    await delay(500);
    // Return the entire updated object
    return HttpResponse.json(timetable);
  }),
];
