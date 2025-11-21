import type { CourseRequirementDto } from "../../interfaces/courseRequirementDtos";

type RequirementSeed = {
  courseCode: string;
  studentGroupName: string;
  classType: CourseRequirementDto["classType"];
  length: number;
  frequency: number;
  priority: CourseRequirementDto["priority"];
  requiredTeacherId?: number;
};

const requirementSyncSource: Record<number, RequirementSeed[]> = {
  1: [
    {
      courseCode: "DB303",
      studentGroupName: "Fall 2025 - Group A",
      classType: "Lab",
      length: 2,
      frequency: 1,
      priority: "High",
    },
    {
      courseCode: "CS350",
      studentGroupName: "Fall 2025 - Group C",
      classType: "Masterclass",
      length: 2,
      frequency: 2,
      priority: "Medium",
      requiredTeacherId: 2,
    },
  ],
};

export function getRequirementSyncSeeds(
  timetableId: number,
): RequirementSeed[] | null {
  return requirementSyncSource[timetableId] ?? null;
}

