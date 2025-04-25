

export interface DaySubjectInfo {
    name: string;
    subjects: string[];
}

export interface TimeslotInfo {
    tStart: string;
    tEnd: string;
    day: DaySubjectInfo[];
}

export interface ScheduleItem {
    timeslots: TimeslotInfo[];
}


export interface ScheduleApiResponse {
    schedule: ScheduleItem[];
}


export interface ProcessedTimeslot {
    key: string;
    start: string;
    end: string;
}


export type ProcessedScheduleMap = {
    [dayName: string]: {
        [timeslotKey: string]: string[];
    };
};

export interface CreateTimeSlotDto {
    start: string;
    end: string;  
}

export interface CreateTimetableRequest {
    title: string;
    timeslots: CreateTimeSlotDto[];
}


export interface Track {
    id: number;
    title: string;
}