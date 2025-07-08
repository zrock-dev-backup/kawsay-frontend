import { academicStructureHandlers } from "./academicStructureHandlers.ts";
import { classHandlers } from "./classHandlers.ts";
import { courseHandlers } from "./courseHandlers.ts";
import { courseRequirementHandlers } from "./courseRequirementHandlers.ts";
import { eomHandlers } from "./eomHandlers.ts";
import { formDataHandlers } from "./formDataHandlers.ts";
import { issueResolutionHandlers } from "./issueResolutionHandlers.ts";
import { schedulingHandlers } from "./schedulingHandlers.ts";
import { studentAuditHandlers } from "./studentAuditHandlers.ts";
import { studentHandlers } from "./studentHandlers.ts";
import { timetableHandlers } from "./timetableHandlers.ts";
import { facultyHandlers } from "./facultyHandlers.ts";

export const handlers = [
  ...timetableHandlers,
  ...academicStructureHandlers,
  ...courseRequirementHandlers,
  ...studentHandlers,
  ...schedulingHandlers,
  ...eomHandlers,
  ...classHandlers,
  ...courseHandlers,
  ...studentAuditHandlers,
  ...issueResolutionHandlers,
  ...formDataHandlers,
  ...facultyHandlers,
];
