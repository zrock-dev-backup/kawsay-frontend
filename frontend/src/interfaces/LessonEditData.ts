
import type { Dayjs } from 'dayjs';


export interface LessonApiData {
    tStart: string;
    tEnd: string;
    day: string;
    subject: string;
   
   
}


export interface LessonEditState {
    tStart: Dayjs | null;
    tEnd: Dayjs | null;
    day: string;
    subject: string;
}