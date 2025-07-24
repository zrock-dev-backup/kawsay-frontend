import type { Course } from "./apiDataTypes";
import type { TeacherAvailabilityConstraint } from "./availabilityDtos";

/**
 * Defines the structure for availability overrides for a single timetable.
 */
export interface TimetableAvailabilityOverride {
  timetableId: number;
  constraints: TeacherAvailabilityConstraint[];
}

export interface TeacherDto {
  id: number;
  fullName: string;
  email: string;
  employmentType: "Full-Time Professor" | "Adjunct Practitioner" | "Lecturer";
  qualifications: Course[];
  isActive: boolean;

  /**
   * Global, default availability constraints that apply to all timetables
   * unless specifically overridden.
   */
  defaultAvailabilityConstraints?: TeacherAvailabilityConstraint[];

  /**
   * An array of timetable-specific availability overrides.
   */
  timetableOverrides?: TimetableAvailabilityOverride[];
}

export type CreateTeacherRequestDto = Omit<TeacherDto, "id">;
export type UpdateTeacherRequestDto = Partial<Omit<TeacherDto, "id">>;

export interface TimetableAssignmentDto {
  assignmentId: number;
  timetableId: number;
  teacherId: number;
  teacherFullName: string; // Denormalized for UI
  startWeek: number;
  endWeek: number;
  maximumWorkload: number;
  workloadUnit: "Classes" | "Hours per Week";
}

export type CreateTimetableAssignmentRequestDto = Omit<
  TimetableAssignmentDto,
  "assignmentId" | "teacherFullName"
>;
