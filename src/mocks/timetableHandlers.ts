import { delay, http, HttpResponse } from "msw";
import { API_BASE_URL } from "../services/api.helpers.ts";
import { db } from "./db.ts";
import type {
  CreateTimetableRequest,
  TimetableStatus,
} from "../interfaces/timetableDtos.ts";
import { MASTER_TIMETABLE_STRUCTURE } from "./data/mockTimetables.ts";

const TIMETABLE_URL = `${API_BASE_URL}/timetable`;

export const timetableHandlers = [
  http.post(TIMETABLE_URL, async ({ request }) => {
    const data = (await request.json()) as CreateTimetableRequest;
    // This is a simplified mock for timetable creation
    const newTimetable = {
      id: db.getNextTimetableId(),
      name: data.name,
      status: "Draft" as TimetableStatus,
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
  http.get(`${TIMETABLE_URL}`, async () => {
    return HttpResponse.json(db.timetables);
  }),

  // GET /api/timetables/master
  http.get(`${TIMETABLE_URL}/master`, async () => {
    return HttpResponse.json(MASTER_TIMETABLE_STRUCTURE);
  }),

  // GET timetable by ID
  http.get(`${TIMETABLE_URL}/:id`, async ({ params }) => {
    const timetable = db.timetables.find((t) => t.id === Number(params.id));
    if (!timetable) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(timetable);
  }),

  http.post(`${TIMETABLE_URL}/:id/publish`, async ({ params }) => {
    const timetableId = Number(params.id);
    const timetable = db.timetables.find((t) => t.id === timetableId);

    if (!timetable) {
      return new HttpResponse(null, { status: 404 });
    }
    timetable.status = "Published";
    await delay(500);
    return HttpResponse.json(timetable);
  }),
];
