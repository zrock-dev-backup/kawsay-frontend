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
