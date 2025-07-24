import { useState, useMemo, useEffect } from "react";
import { useTheme, alpha } from "@mui/material";
import type {
  ConstraintLevel,
  TeacherAvailabilityConstraint,
} from "../../interfaces/availabilityDtos";

const getSlotKey = (dayId: number, periodId: number) => `${dayId}-${periodId}`;

interface UseAvailabilityGridProps {
  initialConstraints: TeacherAvailabilityConstraint[];
  onConstraintsChange: (constraints: TeacherAvailabilityConstraint[]) => void;
  disabled?: boolean;
}

export const useAvailabilityGrid = ({
  initialConstraints,
  onConstraintsChange,
  disabled = false,
}: UseAvailabilityGridProps) => {
  const theme = useTheme();
  const [constraints, setConstraints] = useState(initialConstraints);
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);

  useEffect(() => {
    setConstraints(initialConstraints);
  }, [initialConstraints]);

  const constraintMap = useMemo(() => {
    const map = new Map<string, ConstraintLevel>();
    (constraints || []).forEach(({ level, slots }) => {
      slots.forEach(({ dayId, periodId }) => {
        map.set(getSlotKey(dayId, periodId), level);
      });
    });
    return map;
  }, [constraints]);

  const handleUpdateConstraints = (
    newSelection: Set<string>,
    level: ConstraintLevel | null,
  ) => {
    let currentSlots = (constraints || []).flatMap((c) =>
      c.slots.map((s) => ({ ...s, level: c.level })),
    );
    let updatedSlots = currentSlots.filter(
      (s) => !newSelection.has(getSlotKey(s.dayId, s.periodId)),
    );

    if (level) {
      newSelection.forEach((key) => {
        const [dayId, periodId] = key.split("-").map(Number);
        updatedSlots.push({ dayId, periodId, level });
      });
    }

    const newConstraints = updatedSlots.reduce(
      (acc, { dayId, periodId, level }) => {
        let constraint = acc.find((c) => c.level === level);
        if (!constraint) {
          constraint = { level, slots: [] };
          acc.push(constraint);
        }
        constraint.slots.push({ dayId, periodId });
        return acc;
      },
      [] as TeacherAvailabilityConstraint[],
    );

    setConstraints(newConstraints);
    onConstraintsChange(newConstraints);
    setSelection(new Set());
  };

  const handleMouseDown = (dayId: number, periodId: number) => {
    if (disabled) return;
    setIsSelecting(true);
    setSelection(new Set([getSlotKey(dayId, periodId)]));
  };

  const handleMouseEnter = (dayId: number, periodId: number) => {
    if (!isSelecting || disabled) return;
    setSelection((prev) => new Set(prev).add(getSlotKey(dayId, periodId)));
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
  };

  const getSlotStyle = (dayId: number, periodId: number) => {
    const key = getSlotKey(dayId, periodId);
    const level = constraintMap.get(key);
    const isSelected = selection.has(key);

    const baseStyle = {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      cursor: disabled ? "not-allowed" : "pointer",
      transition: theme.transitions.create("background-color", {
        duration: theme.transitions.duration.shortest,
      }),
    };

    if (disabled)
      return {
        ...baseStyle,
        backgroundColor: theme.palette.action.disabledBackground,
      };
    if (isSelected)
      return {
        ...baseStyle,
        cursor: "crosshair",
        backgroundColor: alpha(theme.palette.primary.light, 0.5),
        border: `1px solid ${theme.palette.primary.main}`,
      };
    if (level === "Hard")
      return {
        ...baseStyle,
        backgroundColor: alpha(theme.palette.error.main, 0.2),
        backgroundImage:
          "repeating-linear-gradient(-45deg, transparent, transparent 4px, rgba(0,0,0,0.05) 4px, rgba(0,0,0,0.05) 8px)",
      };
    if (level === "Soft")
      return {
        ...baseStyle,
        backgroundColor: alpha(theme.palette.warning.main, 0.25),
      };
    return {
      ...baseStyle,
      "&:hover": { backgroundColor: theme.palette.action.hover },
    };
  };

  return {
    selection,
    constraintMap,
    handleMouseDown,
    handleMouseEnter,
    handleMouseUp,
    handleUpdateConstraints,
    getSlotStyle,
  };
};
