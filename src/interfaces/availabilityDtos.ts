/**
 * Defines the level of a constraint.
 * 'Hard' - A non-negotiable rule; the slot cannot be used.
 * 'Soft' - A preference; the slot can be used but is discouraged.
 */
export type ConstraintLevel = "Hard" | "Soft";

/**
 * Represents a single time slot within the timetable grid.
 */
export interface TimeSlotConstraint {
  dayId: number; // Corresponds to TimetableDay.id
  periodId: number; // Corresponds to TimetablePeriod.id
}

/**
 * Defines a complete availability constraint for a teacher,
 * combining a level (Hard/Soft) with a set of affected time slots.
 */
export interface TeacherAvailabilityConstraint {
  level: ConstraintLevel;
  slots: TimeSlotConstraint[];
}
