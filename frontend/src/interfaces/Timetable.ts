

export interface Timeslot {
    id: number;
    start: string;
    end: string;
}

export interface Day {
    id: number;
    name: string;
}

export interface Lesson {
    timeslotId: number;
    dayId: number;
    name: string;


}

export interface TimetableData {
    title: string;
    timeslots: Timeslot[];
    days: Day[];
    lessons: Lesson[];
}