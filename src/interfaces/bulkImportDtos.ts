import type { CourseRequirementDto } from "./courseRequirementDtos";

export interface BulkRequirementRequestItem {
  courseCode: string;
  studentGroupName: string;
  classType: "Masterclass" | "Lab";
  frequency: number;
  length: number;
  priority?: "High" | "Medium" | "Low";
  // TODO: justify why id instead of name
  requiredTeacherId?: number;
}

export interface BulkImportResultDto {
  processedCount: number;
  failedCount: number;
  errors: { csvRow: number; error: string }[];
  createdRequirements: CourseRequirementDto[];
}
