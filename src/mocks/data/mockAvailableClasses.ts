import type { AvailableClassDto } from "../../interfaces/classDtos";
import { getMockClasses } from "./mockClasses";

export const getMockAvailableClasses = (): AvailableClassDto[] => {
  const classes = getMockClasses();

  // Map a subset of classes to available classes with capacities
  return classes.slice(0, 30).map((c, idx) => ({
    ...c,
    id: 200 + c.id,
    capacity: 18 + (idx % 15),
    currentEnrollment: Math.max(0, 5 + (idx % 25)),
    isEligible: idx % 7 !== 0,
    ineligibilityReason: idx % 7 === 0 ? "Capacity reached" : null,
    isRetake: c.courseCode.endsWith("-R") || c.courseCode.includes("Retake"),
  } as AvailableClassDto));
};

