import type { DayPeriodPreferenceDto } from "./apiDataTypes.ts";
import type { ClassType } from "./classDtos.ts";

export interface EligibilitySummary {
  eligible: number;
  total: number;
  issues: number;
}

export interface CourseRequirementDto {
  id: number;
  timetableId: number;

  courseId: number;
  courseName: string;

  studentGroupId: number | null;
  studentGroupName: string | null;
  studentSectionId: number | null;
  studentSectionName: string | null;

  classType: ClassType;
  length: number;
  frequency: number;

  priority: "High" | "Medium" | "Low";
  requiredTeacherId: number | null;

  startDate: string;
  endDate: string;

  schedulingPreferences: DayPeriodPreferenceDto[];
  eligibilitySummary: EligibilitySummary | null;
}

export interface CreateCourseRequirementRequest
  extends Omit<
    CourseRequirementDto,
    "id" | "courseName" | "studentGroupName" | "studentSectionName"
  > {}

export interface CourseRequirementFormData extends CreateCourseRequirementRequest {
  cohortId?: number | null;
  groupId?: number | null;
}
