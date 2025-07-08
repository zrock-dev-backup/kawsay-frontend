import type { Course } from "./apiDataTypes";

export interface TeacherDto {
  id: number;
  fullName: string;
  email: string;
  employmentType: "Full-Time Professor" | "Adjunct Practitioner" | "Lecturer";
  qualifications: Course[];
  isActive: boolean;
}

export type CreateTeacherRequestDto = Omit<TeacherDto, "id">;
export type UpdateTeacherRequestDto = Partial<CreateTeacherRequestDto>;

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
