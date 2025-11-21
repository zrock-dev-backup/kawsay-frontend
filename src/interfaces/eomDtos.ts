export interface GradeSyncErrorDto {
  csvRow: number;
  studentId?: number;
  error: string;
}

export interface RetakeDemandDto {
  courseCode: string;
  studentCount: number;
}

export interface AdvancingCohortDto {
  cohortName: string;
  studentCount: number;
}

export interface GradeSyncReportDto {
  processedCount: number;
  failedCount: number;
  syncedAt: string;
  source: string;
  errors: GradeSyncErrorDto[];
  retakeDemand: RetakeDemandDto[];
  advancingCohorts: AdvancingCohortDto[];
}

export interface EnrollmentProposalResultDto {
  message: string;
  proposalsCreated: number;
  preparedAt: string;
}

