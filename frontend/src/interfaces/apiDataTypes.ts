// src/interfaces/apiDataTypes.ts

import type { Dayjs } from 'dayjs'; // Required for LessonEditState

// --- Interfaces for Track Selection (/api/table/tracks) ---

export interface Track {
    id: number;
    title: string;
}

// --- Interfaces for Timetable Creation (/api/table/create) ---

/** Data structure for a single timeslot in the creation request */
export interface CreateTimeSlotDto {
    start: string; // HH:mm format
    end: string;   // HH:mm format
}

/** Data structure for the entire timetable creation request body */
export interface CreateTimetableRequest {
    title: string;
    timeslots: CreateTimeSlotDto[];
}

// --- Interfaces for Timetable Grid Display (/api/table/{id}) ---
// Based on the second API structure provided for GET /api/table/{id}

// NEW: Interface for the subject object
export interface Subject {
    id: number;
    title: string;
}

/** Information about subjects for a specific day within a timeslot */
export interface DaySubjectInfo {
    name: string; // e.g., "Monday"
    // UPDATED: Use Subject[] instead of string[]
    subjects: Subject[];
}

/** Information about a specific timeslot, including days/subjects within it */
export interface TimeslotInfo {
    tStart: string; // HH:mm format
    tEnd: string;   // HH:mm format
    day: DaySubjectInfo[]; // Contains info for specific days within this timeslot
}

/** Represents the object within the 'schedule' array */
export interface ScheduleItemDto {
    timeslots: TimeslotInfo[];
}

/** The root structure of the API response for GET /api/table/{id} */
export interface ScheduleApiResponse {
    schedule: ScheduleItemDto[]; // Assuming schedule is always an array
}

// --- Interfaces for Internal Processing in TimetableGridPage ---

/** Represents a unique timeslot row in the grid */
export interface ProcessedTimeslot {
    key: string; // e.g., "8:30-10:00"
    start: string;
    end: string;
}

/** The structure of the map used for efficient subject lookup in the grid */
export type ProcessedScheduleMap = {
    [dayName: string]: {
        // UPDATED: Store Subject[] instead of string[]
        [timeslotKey: string]: Subject[]; // timeslotKey is like "8:30-10:00"
    };
};


// --- Interfaces for Lesson Editing (/api/lesson/{id}) ---

/** Data structure expected by the API for GET/PUT lesson requests */
export interface LessonApiData {
    tStart: string; // HH:mm format
    tEnd: string;   // HH:mm format
    day: string;
    subject: string;
    // Optional: Add if your API uses/returns a specific lesson ID
    // lessonId?: number | string;
}

/** Data structure used for the state within the LessonEditPage component */
export interface LessonEditState {
    tStart: Dayjs | null; // Use Dayjs for TimePicker component
    tEnd: Dayjs | null;   // Use Dayjs for TimePicker component
    day: string;
    subject: string;
}