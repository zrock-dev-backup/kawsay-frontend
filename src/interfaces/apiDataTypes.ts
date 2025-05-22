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
}

export interface PeriodPreference {
    id: number;
    startPeriodId: number;
}

export interface Class {
    id: number;
    timetableId: number;
    courseDto: Course;
    teacherDto: Teacher | null;
    classOccurrences: ClassOccurrence[];
    length: number;
    frequency: number;
}

export interface CreatePeriodPreferenceRequest {
    startPeriodId: number;
}

export interface CreateClassRequest {
    timetableId: number;
    courseId: number;
    teacherId: number;
    length: number;
    frequency: number;
    periodPreferencesList: CreatePeriodPreferenceRequest[];
}
