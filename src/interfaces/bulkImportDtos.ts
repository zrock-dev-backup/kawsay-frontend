import type { CourseRequirementDto } from "./courseRequirementDtos";

// --- Course Requirement Import ---
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

export interface CourseBulkImportResultDto {
  processedCount: number;
  failedCount: number;
  errors: { csvRow: number; error: string }[];
  createdRequirements: CourseRequirementDto[];
}

// --- Academic Structure Import ---
export interface BulkStructureRequestItem {
  studentId: number;
  studentName: string;
  cohortName: string;
  groupName: string;
  sectionName: string;
}

export interface StructureBulkImportResultDto {
  processedCount: number;
  failedCount: number;
  errors: { csvRow: number; error: string }[];
  summary: {
    cohorts: { created: string[]; found: string[] };
    groups: { created: string[]; found: string[] };
    sections: { created: string[]; found: string[] };
  };
}
