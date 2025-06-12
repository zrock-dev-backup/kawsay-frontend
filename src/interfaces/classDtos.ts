import type {
  ClassOccurrence,
  DayPeriodPreferenceDto,
} from "./apiDataTypes.ts";
import type { Dayjs } from "dayjs";

export type ClassType = "Masterclass" | "Lab";

export interface Class {
  id: number;
  timetableId: number;
  length: number;
  frequency: number;
  classType: ClassType;
  startDate: string | null;
  endDate: string | null;

  courseId: number;
  courseName: string;
  courseCode: string;

  teacherId: number | null;
  teacherName: string | null;

  classOccurrences: ClassOccurrence[];
  periodPreferences: DayPeriodPreferenceDto[];
}

export interface ClassFormState {
  id: number | null;
  timetableId: number;
  courseId: number | null;
  teacherId: number | null;
  length: number;
  frequency: number;
  classType: ClassType;

  startDate: Dayjs | null;
  endDate: Dayjs | null;
  periodPreferences: DayPeriodPreferenceDto[];
}
