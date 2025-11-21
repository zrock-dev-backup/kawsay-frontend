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

export interface ClassOccurrence {
  id?: number;
  date: string; // Format: "YYYY-MM-DD"
  startPeriodId: number;
}

export interface PeriodPreference {
  id: number;
  startPeriodId: number;
}

export interface DayPeriodPreferenceDto {
  dayId: number;
  startPeriodId: number;
}
