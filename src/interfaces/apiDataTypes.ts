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

export interface StudentDto {
  id: number;
  name: string;
  standing:
    | "GoodStanding"
    | "AcademicProbation"
    | "Suspended"
    | "Withdrawn"
    | string;
}

export interface StudentEnrollmentDto {
  id: number; // Class ID
  courseName: string;
  courseCode: string;
}

export interface StudentCohortDto {
  advancingStudents: StudentDto[];
  retakeStudents: StudentDto[];
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
