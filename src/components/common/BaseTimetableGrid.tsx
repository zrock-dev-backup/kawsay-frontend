import React from "react";
import { Box, Paper } from "@mui/material";
import type { TimetableStructure } from "../../interfaces/timetableDtos";
import {
  DayHeaderCell,
  TimeLabelCell,
  TopLeftCell,
} from "../timetable/WeekView.styles";
import { GridContainer } from "../scheduling/SchedulingGrid.styles";

interface BaseTimetableGridProps {
  timetableStructure: TimetableStructure;
  renderSlotContent: (dayId: number, periodId: number) => React.ReactNode;
  onMouseUp?: () => void;
  onMouseLeave?: () => void;
}

export const BaseTimetableGrid: React.FC<BaseTimetableGridProps> = ({
  timetableStructure,
  renderSlotContent,
  onMouseUp,
  onMouseLeave,
}) => {
  const sortedPeriods = [...timetableStructure.periods].sort((a, b) =>
    a.start.localeCompare(b.start),
  );

  return (
    <Paper
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      sx={{ overflow: "auto", border: "1px solid", borderColor: "divider" }}
    >
      <GridContainer
        sx={{
          gridTemplateRows: `auto repeat(${sortedPeriods.length}, minmax(50px, auto))`,
          gridTemplateColumns: `60px repeat(${timetableStructure.days.length}, 1fr)`,
        }}
      >
        <TopLeftCell />
        {timetableStructure.days.map((day) => (
          <DayHeaderCell key={day.id} isactive="true">
            {day.name.substring(0, 3)}
          </DayHeaderCell>
        ))}

        {sortedPeriods.map((period, pIndex) => (
          <React.Fragment key={period.id}>
            <TimeLabelCell sx={{ gridRow: pIndex + 2 }}>
              {period.start}
            </TimeLabelCell>
            {timetableStructure.days.map((day, dIndex) => (
              <Box
                key={`${day.id}-${period.id}`}
                sx={{
                  gridRow: pIndex + 2,
                  gridColumn: dIndex + 2,
                  position: "relative",
                }}
              >
                {renderSlotContent(day.id, period.id)}
              </Box>
            ))}
          </React.Fragment>
        ))}
      </GridContainer>
    </Paper>
  );
};
