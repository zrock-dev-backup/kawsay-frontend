import type {ClassOccurrence, Course, CreatePeriodPreferenceRequest, Teacher,} from './apiDataTypes.ts';
import type {Dayjs} from 'dayjs';

export type ClassType = "Masterclass" | "Lab";

export interface Class {
    id: number;
    timetableId: number;
    courseDto: Course;
    teacherDto: Teacher | null;
    classOccurrences: ClassOccurrence[];
    length: number;
    frequency: number;
    classType: ClassType;
    startDate: Dayjs | null;
    endDate: Dayjs | null;
}

export interface CreateClassRequest {
    timetableId: number;
    courseId: number;
    teacherId: number;
    length: number;
    frequency: number;
    periodPreferences: CreatePeriodPreferenceRequest[];
    classType: ClassType;
    startDate: Dayjs | null;
    endDate: Dayjs | null;
}
