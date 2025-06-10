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
    startDate: string; // Format: "YYYY-MM-DD"
    endDate: string;   // Format: "YYYY-MM-DD"
    days: TimetableDay[];
    periods: TimetablePeriod[];
}

export interface CreateTimetableRequest {
    name: string;
    startDate: string; // Format: "YYYY-MM-DD"
    endDate: string;   // Format: "YYYY-MM-DD"
    days: string[];
    periods: {
        start: string;
        end: string;
    }[];
}

export interface ClassOccurrence {
    id?: number;
    date: string; // Format: "YYYY-MM-DD"
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
    dayId: number;
    startPeriodId: number;
}

export interface CreateClassRequest {
    timetableId: number;
    courseId: number;
    teacherId: number;
    length: number;
    frequency: number;
    periodPreferences: CreatePeriodPreferenceRequest[];
}

export interface GradeIngestionDto {
    studentId: number;
    courseId: number;
    gradeValue: number;
}

export interface StudentDto {
    id: number;
    name: string;
    standing: 'GoodStanding' | 'AcademicProbation' | 'Suspended' | 'Withdrawn' | string; // Allow for other string values
}

export interface StudentCohortDto {
    advancingStudents: StudentDto[];
    retakeStudents: StudentDto[];
}
