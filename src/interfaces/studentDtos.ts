export interface StudentDto {
  id: number;
  currentCourseLoad: number;
  name: string;
  standing:
    | "GoodStanding"
    | "AcademicProbation"
    | "Suspended"
    | "Withdrawn"
    | string;
  proposedEnrollmentCount: number;
}

export interface ProposedEnrollmentDto {
  classId: number;
  courseName: string;
  courseCode: string;
  teacherName: string | null;
  reason: string;
}

export interface StudentEnrollmentDto {
  id: number; // Class ID
  courseName: string;
  courseCode: string;
}
