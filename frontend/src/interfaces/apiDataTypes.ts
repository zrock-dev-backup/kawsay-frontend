// src/interfaces/apiDataTypes.ts

import type { Dayjs } from 'dayjs'; // Keep for frontend state types

// --- Basic Entities ---

export interface Course {
    id: number;
    name: string;
    code: string;
}

export interface Teacher {
    id: number;
    name: string;
    type: "Professor" | "Faculty Practitioner"; // Using literal types for validation hint
}

// --- Timetable Structure ---

export interface TimetableDay {
    id: number;
    name: string; // e.g., "Monday"
}

export interface TimetablePeriod {
    id: number;
    start: string; // HH:mm format, e.g., "08:00"
    end: string;   // HH:mm format, e.g., "08:30"
}

export interface TimetableStructure {
    id: number;
    name: string; // Renamed from 'title' in old API
    days: TimetableDay[];
    periods: TimetablePeriod[];
}

// --- Timetable Creation ---

// Request body for POST /kawsay/timetable
export interface CreateTimetableRequest {
    name: string; // Renamed from 'title'
    days: string[]; // Array of day names (strings)
    periods: { // Array of periods (start/end strings)
        start: string; // HH:mm
        end: string;   // HH:mm
    }[];
}

// Response body for POST /kawsay/timetable is TimetableStructure

// --- Class and Occurrences ---

export interface ClassOccurrence {
    id?: number; // Optional for POST, present in GET/PUT response
    dayId: number; // References TimetableDay.id
    startPeriodId: number; // References TimetablePeriod.id
    length: number; // Number of consecutive periods
}

export interface Class {
    id: number;
    timetableId: number; // References TimetableStructure.id
    course: Course; // Embedded Course object in GET/PUT response
    teacher: Teacher | null; // Embedded Teacher object (or null) in GET/PUT response
    occurrences: ClassOccurrence[];
    // Note: name and code are derived from the Course object
}

// Request body for POST /kawsay/class
export interface CreateClassRequest {
    timetableId: number;
    courseId: number; // References Course.id
    teacherId: number | null; // References Teacher.id (or null)
    occurrences: Omit<ClassOccurrence, 'id'>[]; // Occurrences without IDs for creation
}

// Request body for PUT /kawsay/class/{id}
export interface UpdateClassRequest {
    id: number; // Matches URL param
    timetableId: number; // Should match the class's current timetableId
    courseId: number; // References Course.id
    teacherId: number | null; // References Teacher.id (or null)
    occurrences: ClassOccurrence[]; // Include IDs for existing occurrences
}


// --- Frontend State Types (needs review/refactoring later) ---
// This interface is from the old frontend structure and will likely need
// significant changes when refactoring LessonEditPage to work with the
// new Class/Occurrence data model. Keeping it here for now as it exists
// in the original file, but it's marked for future refactoring.
export interface LessonEditState {
    tStart: Dayjs | null;
    tEnd: Dayjs | null;
    day: string;
    subject: string;
    // Additional fields might be needed based on new API (e.g., occurrenceId, classId, dayId, startPeriodId, length)
}
