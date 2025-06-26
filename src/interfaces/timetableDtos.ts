export type TimetableStatus = "Draft" | "Published";

export interface TimetableDay {
  id: number;
  name: string;
}

export interface TimetablePeriod {
  id: number;
  start: string;
  end: string;
}

export interface TimetableStructure {
  id: number;
  name: string;
  status: TimetableStatus;
  startDate: string; // Format: "YYYY-MM-DD"
  endDate: string; // Format: "YYYY-MM-DD"
  days: TimetableDay[];
  periods: TimetablePeriod[];
}

export interface CreateTimetableRequest {
  name: string;
  startDate: string; // Format: "YYYY-MM-DD"
  endDate: string; // Format: "YYYY-MM-DD"
  days: string[];
  periods: {
    start: string;
    end: string;
  }[];
}
