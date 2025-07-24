import React from "react";
import { Box, Tooltip, useTheme } from "@mui/material";
import type { TimetableStructure } from "../../interfaces/timetableDtos";
import type { EffectiveConstraint } from "../../hooks/faculty/useEffectiveAvailability";

interface AvailabilitySparklineProps {
  constraintMap: Map<string, EffectiveConstraint>;
  timetableStructure: TimetableStructure;
  tooltipTitle: string;
}

const getSlotKey = (dayId: number, periodId: number) => `${dayId}-${periodId}`;

export const AvailabilitySparkline: React.FC<AvailabilitySparklineProps> =
  React.memo(({ constraintMap, timetableStructure, tooltipTitle }) => {
    const theme = useTheme();

    const sortedPeriods = [...timetableStructure.periods].sort((a, b) =>
      a.start.localeCompare(b.start),
    );

    const getColorForConstraint = (
      constraint?: EffectiveConstraint,
    ): string => {
      if (!constraint) return theme.palette.action.disabledBackground;
      if (constraint.level === "Hard") return theme.palette.error.main;
      if (constraint.level === "Soft") return theme.palette.warning.main;
      if ((constraint.level as any) === "Available")
        return theme.palette.success.main;
      return theme.palette.action.disabledBackground;
    };

    return (
      <Tooltip title={tooltipTitle} placement="top" arrow>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: `repeat(${timetableStructure.days.length}, 1fr)`,
            gap: "2px",
            width: "100px",
            height: "40px",
            padding: "2px",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            backgroundColor: theme.palette.background.default,
          }}
        >
          {timetableStructure.days.map((day) => (
            <Box
              key={day.id}
              sx={{
                display: "grid",
                gridTemplateRows: `repeat(${sortedPeriods.length}, 1fr)`,
                gap: "1px",
              }}
            >
              {sortedPeriods.map((period) => {
                const key = getSlotKey(day.id, period.id);
                const constraint = constraintMap.get(key);
                return (
                  <Box
                    key={period.id}
                    sx={{
                      backgroundColor: getColorForConstraint(constraint),
                      borderRadius: "1px",
                    }}
                  />
                );
              })}
            </Box>
          ))}
        </Box>
      </Tooltip>
    );
  });

AvailabilitySparkline.displayName = "AvailabilitySparkline";
