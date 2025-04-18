// src/interfaces/LessonEditData.ts (or reuse/extend existing interfaces)
import type { Dayjs } from 'dayjs';

// Interface for the data structure expected by the API (strings)
export interface LessonApiData {
    tStart: string;
    tEnd: string;
    day: string;
    subject: string;
    // Add an ID if needed to identify which lesson to update
    // lessonId?: number | string;
}

// Interface for the component's state (using Dayjs for pickers)
export interface LessonEditState {
    tStart: Dayjs | null;
    tEnd: Dayjs | null;
    day: string;
    subject: string;
}