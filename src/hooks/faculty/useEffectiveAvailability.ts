import { useMemo } from "react";
import type {
  TeacherAvailabilityConstraint,
  TimetableAvailabilityOverride,
  ConstraintLevel,
} from "../../interfaces/availabilityDtos";

export interface EffectiveConstraint {
  level: ConstraintLevel;
  /** Indicates if the constraint is inherited from global defaults or a specific local override. */
  source: "default" | "local-override";
}

const getSlotKey = (dayId: number, periodId: number) => `${dayId}-${periodId}`;

interface UseEffectiveAvailabilityProps {
  defaultConstraints?: TeacherAvailabilityConstraint[];
  timetableOverrides?: TimetableAvailabilityOverride[];
  activeTimetableId: number | null;
}

export const useEffectiveAvailability = ({
  defaultConstraints = [],
  timetableOverrides = [],
  activeTimetableId,
}: UseEffectiveAvailabilityProps) => {
  const effectiveConstraintMap = useMemo(() => {
    const map = new Map<string, EffectiveConstraint>();

    // 1. Apply the default constraints first.
    defaultConstraints.forEach(({ level, slots }) => {
      slots.forEach(({ dayId, periodId }) => {
        map.set(getSlotKey(dayId, periodId), { level, source: "default" });
      });
    });

    // 2. Find and apply the local overrides for the active timetable, if they exist.
    if (activeTimetableId) {
      const overrides = timetableOverrides.find(
        (o) => o.timetableId === activeTimetableId,
      );

      if (overrides) {
        overrides.constraints.forEach(({ level, slots }) => {
          slots.forEach(({ dayId, periodId }) => {
            // This will overwrite any default constraint for the same slot.
            map.set(getSlotKey(dayId, periodId), {
              level,
              source: "local-override",
            });
          });
        });
      }
    }

    return map;
  }, [defaultConstraints, timetableOverrides, activeTimetableId]);

  return { effectiveConstraintMap };
};
