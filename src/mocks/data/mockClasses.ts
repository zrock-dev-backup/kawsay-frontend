import type { Class } from "../../interfaces/classDtos";
import { getMockCourses, getMockTeachers } from "./mockCoursesAndTeachers";
import { getMockTimetables } from "./mockTimetables";

const courses = getMockCourses();
const teachers = getMockTeachers();
const timetables = getMockTimetables();

const formatIso = (y: number, m: number, d: number) =>
  new Date(Date.UTC(y, m - 1, d)).toISOString();

const formatDateKey = (y: number, m: number, d: number) => {
  const mm = `${m}`.padStart(2, "0");
  const dd = `${d}`.padStart(2, "0");
  return `${y}-${mm}-${dd}`;
};

export const getMockClasses = (): Class[] => {
  const total = 60;
  const list: Class[] = [];

  for (let i = 0; i < total; i++) {
    const id = i + 1;
    const course = courses[i % courses.length];
    const teacher = teachers[i % teachers.length] ?? teachers[0];
    const timetable = i % 6 === 0 ? timetables[1] : timetables[0];
    const year = timetable.id === 1 ? 2025 : 2026;
    const month = timetable.id === 1 ? 9 : 2;
    const startDay = 1 + (i % 20);
    const endDay = Math.min(startDay + (6 + (i % 8)), 28);

    const classType: Class["classType"] = i % 3 === 0 ? "Lab" : "Masterclass";

    // Build a few simple occurrences so the MonthView can display lessons
    const occurrences = [] as { id?: number; date: string; startPeriodId: number }[];
    const occCount = 2 + (i % 4); // 2..5 occurrences per class
    for (let o = 0; o < occCount; o++) {
      // spread occurrences within the class start..end window
      const offset = (o * 3 + i) % Math.max(1, endDay - startDay + 1);
      const dayNum = startDay + offset;
      occurrences.push({
        id: id * 100 + o,
        date: formatDateKey(year, month, Math.min(Math.max(dayNum, 1), 28)),
        startPeriodId: timetable.periods[i % timetable.periods.length].id,
      });
    }

    list.push({
      id,
      timetableId: timetable.id,
      length: 1 + (i % 3),
      frequency: 1 + (i % 2),
      classType,
      startDate: formatIso(year, month, startDay),
      endDate: formatIso(year, month + 1, endDay),
      courseId: course.id,
      courseName: course.name,
      courseCode: course.code,
      teacherId: teacher.id,
      teacherName: teacher.fullName,
      classOccurrences: occurrences,
      periodPreferences: [
        {
          dayId: timetable.days[i % timetable.days.length].id,
          startPeriodId: timetable.periods[i % timetable.periods.length].id,
        },
      ],
    } as Class);
  }

  return list;
};
