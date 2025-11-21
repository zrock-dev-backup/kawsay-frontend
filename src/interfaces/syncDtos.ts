export interface AcademicStructureSyncResultDto {
  source: string;
  startedAt: string;
  completedAt: string;
  processedStudents: number;
  cohortsCreated: number;
  groupsCreated: number;
  sectionsCreated: number;
  message: string;
  warnings?: string[];
}

export interface CourseRequirementSyncResultDto {
  source: string;
  startedAt: string;
  completedAt: string;
  requirementsCreated: number;
  requirementsUpdated: number;
  skipped: number;
  message: string;
  warnings?: string[];
}

