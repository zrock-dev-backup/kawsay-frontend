export interface SummaryDto {
  id: number;
  name: string;
}

export interface CourseSummaryDto {
  id: number;
  name: string; // Pre-formatted as "Course Name (CODE)"
  code: string;
}
