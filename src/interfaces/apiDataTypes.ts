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

export interface GradeIngestionDto {
  studentId: number;
  courseId: number;
  gradeValue: number;
}

export interface StudentCohortDto {
  advancingStudents: { id: number; name: string }[];
  retakeStudents: { id: number; name: string }[];
}

export interface BulkAdvanceRequest {
  timetableId: number;
  studentIds: number[];
}

export interface BulkRetakeRequest {
  timetableId: number;
  studentIds: number[];
}

export interface BulkActionResponse {
  message: string;
  processedCount: number;
}
