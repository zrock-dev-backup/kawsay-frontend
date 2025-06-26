import { courseRequirementHandlers } from "./courseRequirementHandlers";
import { studentHandlers } from "./studentHandlers";
import { eomHandlers } from "./eomHandlers";

export const handlers = [
  ...courseRequirementHandlers,
  ...studentHandlers,
  ...eomHandlers,
];
