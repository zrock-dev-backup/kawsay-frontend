import { courseRequirementHandlers } from "./courseRequirementHandlers";
import { studentHandlers } from "./studentHandlers";
import { eomHandlers } from "./eomHandlers";
import { schedulingHandlers } from "./schedulingHandlers.ts";
import { timetableHandlers } from "./timetableHandlers.ts";
import { classHandlers } from "./classHandlers.ts";
import { academicStructureHandlers } from "./academicStructureHandlers.ts";
import { studentAuditHandlers } from "./studentAuditHandlers.ts"; // NEW

export const handlers = [
  ...courseRequirementHandlers,
  ...studentHandlers,
  ...eomHandlers,
  ...schedulingHandlers,
  ...timetableHandlers,
  ...classHandlers,
  ...academicStructureHandlers,
  ...studentAuditHandlers, // NEW
];
