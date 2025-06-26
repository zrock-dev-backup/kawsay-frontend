import { courseRequirementHandlers } from "./courseRequirementHandlers";
import { studentHandlers } from "./studentHandlers";
import { eomHandlers } from "./eomHandlers";
import { schedulingHandlers } from "./schedulingHandlers.ts";
import { timetableHandlers } from "./timetableHandlers.ts";

export const handlers = [
  ...courseRequirementHandlers,
  ...studentHandlers,
  ...eomHandlers,
  ...schedulingHandlers,
  ...timetableHandlers,
];
