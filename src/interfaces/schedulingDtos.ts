export interface StagedPlacementDto {
  id: number;
  courseRequirementId: number;
  courseName: string;
  courseCode: string;
  dayId: number;
  startPeriodId: number;
  length: number;
}

export interface SlotSatisfactionDetail {
  constraint:
    | "Teacher Preference"
    | "Student Preference"
    | "Building Proximity"
    | "Other";
  isMet: boolean;
  message: string;
}

export interface ValidSlotDto {
  dayId: number;
  startPeriodId: number;
  satisfaction: {
    score: number;
    details: SlotSatisfactionDetail[];
  };
}

export interface FinalizeScheduleRequest {
  timetableId: number;
}

export interface FinalizeScheduleResponse {
  message: string;
  classesCreated: number;
}
