import type { Dayjs } from 'dayjs';
export interface Course {
    id: number;
    name: string;
    code: string;
}
export interface Teacher {
    id: number;
    name: string;
    type: "Professor" | "Faculty Practitioner";
}
export interface TimetableDay {
    id: number;
    name: string;
}
export interface TimetablePeriod {
    id: number;
    start: string;
    end: string;
}
export interface TimetableStructure {
    id: number;
    name: string;
    days: TimetableDay[];
    periods: TimetablePeriod[];
}
export interface CreateTimetableRequest {
    name: string;
    days: string[];
    periods: {
        start: string;
        end: string;
    }[];
}
export interface ClassOccurrence {
    id?: number;
    dayId: number;
    startPeriodId: number;
    length: number;
}
export interface Class {
    id: number;
    timetableId: number;
    course: Course;
    teacher: Teacher | null;
    occurrences: ClassOccurrence[];
}
export interface CreateClassRequest {
    timetableId: number;
    courseId: number;
    teacherId: number | null;
    occurrences: Omit<ClassOccurrence, 'id'>[];
}
export interface UpdateClassRequest {
    id: number;
    timetableId: number;
    courseId: number;
    teacherId: number | null;
    occurrences: ClassOccurrence[];
}
export interface LessonEditState {
    tStart: Dayjs | null;
    tEnd: Dayjs | null;
    day: string;
    subject: string;
}
