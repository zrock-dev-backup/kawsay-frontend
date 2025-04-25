

import type { Dayjs } from 'dayjs';



export interface Track {
    id: number;
    title: string;
}



/** Data structure for a single timeslot in the creation request */
export interface CreateTimeSlotDto {
    start: string;
    end: string;  
}

/** Data structure for the entire timetable creation request body */
export interface CreateTimetableRequest {
    title: string;
    timeslots: CreateTimeSlotDto[];
}





export interface Subject {
    id: number;
    title: string;
}

/** Information about subjects for a specific day within a timeslot */
export interface DaySubjectInfo {
    name: string;
   
    subjects: Subject[];
}

/** Information about a specific timeslot, including days/subjects within it */
export interface TimeslotInfo {
    tStart: string;
    tEnd: string;  
    day: DaySubjectInfo[];
}

/** Represents the object within the 'schedule' array */
export interface ScheduleItemDto {
    timeslots: TimeslotInfo[];
}

/** The root structure of the API response for GET /api/table/{id} */
export interface ScheduleApiResponse {
    schedule: ScheduleItemDto[];
}



/** Represents a unique timeslot row in the grid */
export interface ProcessedTimeslot {
    key: string;
    start: string;
    end: string;
}

/** The structure of the map used for efficient subject lookup in the grid */
export type ProcessedScheduleMap = {
    [dayName: string]: {
       
        [timeslotKey: string]: Subject[];
    };
};




/** Data structure expected by the API for GET/PUT lesson requests */
export interface LessonApiData {
    tStart: string;
    tEnd: string;  
    day: string;
    subject: string;
   
   
}

/** Data structure used for the state within the LessonEditPage component */
export interface LessonEditState {
    tStart: Dayjs | null;
    tEnd: Dayjs | null;  
    day: string;
    subject: string;
}