import type {ClassOccurrence, Course, CreatePeriodPreferenceRequest, Teacher,} from './apiDataTypes.ts';

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
}

export interface CreateClassRequest {
    timetableId: number;
    courseId: number;
    teacherId: number;
    length: number;
    frequency: number;
    periodPreferences: CreatePeriodPreferenceRequest[];

    classType: ClassType;
    studentGroupId?: number;
    sectionId?: number;
}
