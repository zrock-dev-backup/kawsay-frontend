export interface StudentGradeInputDto {
  studentId: number;
  courseId: number;
  semester: number;
  gradeLab: number;
  gradeMasterclass: number;
}

export type PredictionOutcome = "PASS" | "FAIL";

export interface StudentPredictionDto {
  studentId: number;
  courseId: number;
  semester: number;
  predictedOutcome: PredictionOutcome;
  confidence: number;
  drivers: string[];
}