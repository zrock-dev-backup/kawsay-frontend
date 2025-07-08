import { delay, http, HttpResponse } from "msw";
import { API_BASE_URL } from "../services/api.helpers.ts";
import { db } from "./db.ts";
import type {
  CreateTeacherRequestDto,
  UpdateTeacherRequestDto,
} from "../interfaces/teacherDtos.ts";

const FACULTY_URL = `${API_BASE_URL}/teachers`;

export const facultyHandlers = [
  // GET /api/teachers
  // Retrieves all active teachers.
  http.get(FACULTY_URL, async () => {
    await delay(250);
    const activeTeachers = db.teachers.filter((teacher) => teacher.isActive);
    return HttpResponse.json(activeTeachers);
  }),

  // POST /api/teachers
  // Creates a new teacher profile.
  http.post(FACULTY_URL, async ({ request }) => {
    const data = (await request.json()) as CreateTeacherRequestDto;

    // Basic validation
    if (!data.fullName || !data.email) {
      return HttpResponse.json(
        { message: "Full name and email are required." },
        { status: 400 },
      );
    }

    const newTeacher = {
      ...data,
      id: db.getNextTeacherId(),
    };

    db.teachers.push(newTeacher);

    await delay(400);
    return HttpResponse.json(newTeacher, { status: 201 });
  }),

  // PUT /api/teachers/:id
  // Updates an existing teacher's profile.
  http.put(`${FACULTY_URL}/:id`, async ({ request, params }) => {
    const teacherId = Number(params.id);
    const data = (await request.json()) as UpdateTeacherRequestDto;

    const teacherIndex = db.teachers.findIndex((t) => t.id === teacherId);

    if (teacherIndex === -1) {
      return HttpResponse.json({ message: "Teacher not found" }, { status: 404 });
    }

    const updatedTeacher = {
      ...db.teachers[teacherIndex],
      ...data,
    };

    db.teachers[teacherIndex] = updatedTeacher;

    await delay(400);
    return HttpResponse.json(updatedTeacher, { status: 200 });
  }),

  // DELETE /api/teachers/:id
  // Deactivates a teacher (soft delete).
  http.delete(`${FACULTY_URL}/:id`, async ({ params }) => {
    const teacherId = Number(params.id);
    const teacherIndex = db.teachers.findIndex((t) => t.id === teacherId);

    if (teacherIndex === -1) {
      return HttpResponse.json({ message: "Teacher not found" }, { status: 404 });
    }

    // Soft delete by setting isActive to false
    db.teachers[teacherIndex].isActive = false;

    await delay(500);
    // RESTful practice is to return 204 No Content on successful deletion.
    return new HttpResponse(null, { status: 204 });
  }),
];
