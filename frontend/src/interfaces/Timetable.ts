// src/interfaces/NewTimetable.ts (or update existing file)

export interface DaySubjectInfo {
    name: string; // e.g., "Monday"
    subjects: string[]; // Array of subject names
}

export interface TimeslotInfo {
    tStart: string;
    tEnd: string;
    day: DaySubjectInfo[]; // Contains info for specific days within this timeslot
}

export interface ScheduleItem {
    timeslots: TimeslotInfo[];
}

// Interface for the root API response
export interface ScheduleApiResponse {
    schedule: ScheduleItem[]; // Assuming schedule is always an array, possibly with one item
}

// Interface for a processed timeslot (for unique rows)
export interface ProcessedTimeslot {
    key: string; // e.g., "8:30-10:00"
    start: string;
    end: string;
}

// Interface for the processed map for easy lookup
export type ProcessedScheduleMap = {
    [dayName: string]: {
        [timeslotKey: string]: string[]; // timeslotKey is like "8:30-10:00"
    };
};

export interface CreateTimeSlotDto {
    start: string; // HH:mm format
    end: string;   // HH:mm format
}

export interface CreateTimetableRequest {
    title: string;
    timeslots: CreateTimeSlotDto[];
}

// src/interfaces/Track.ts (Ensure this exists)
export interface Track {
    id: number;
    title: string;
}