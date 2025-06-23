import React from "react";
import { Box, Paper, Tooltip, Typography } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import {
  BackgroundCell,
  DayHeaderCell,
  TimeLabelCell,
  TopLeftCell,
} from "../timetable/WeekView.styles.ts";
import {
  useGridViewModel,
  GridCellViewModel,
} from "../../hooks/scheduling/useGridViewModel.ts";
import {
  GridContainer,
  SlotOverlay,
  StagedPlacementItem,
} from "./SchedulingGrid.styles.ts";

const renderCell = (cell: GridCellViewModel) => {
  const style = {
    gridColumn: cell.gridColumn,
    gridRow: cell.rowSpan
      ? `${cell.gridRow} / span ${cell.rowSpan}`
      : cell.gridRow,
  };

  switch (cell.type) {
    case "STAGED_PLACEMENT":
      return (
        <StagedPlacementItem
          key={cell.key}
          sx={style}
          elevation={2}
          onClick={cell.onClick}
        >
          <Typography variant="caption" fontWeight="bold">
            {cell.courseCode}
          </Typography>
          <Typography variant="caption" display="block" noWrap>
            {cell.courseName}
          </Typography>
        </StagedPlacementItem>
      );
    case "VALID_SLOT":
      return (
        <Box key={cell.key} sx={{ ...style, position: "relative" }}>
          <Tooltip title={cell.tooltip} placement="top">
            <SlotOverlay status={cell.status!} onClick={cell.onClick}>
              {cell.status === "ideal" && (
                <CheckCircleOutlineIcon fontSize="small" />
              )}
              {cell.status === "viable" && (
                <ErrorOutlineIcon fontSize="small" />
              )}
            </SlotOverlay>
          </Tooltip>
        </Box>
      );
    default:
      return null;
  }
};

const SchedulingGrid: React.FC = () => {
  const { gridCells, structure, sortedPeriods } = useGridViewModel();

  if (!structure)
    return <Typography>Timetable structure not loaded.</Typography>;

  return (
    <Paper sx={{ height: "100%", overflow: "auto" }}>
      <GridContainer
        sx={{
          gridTemplateRows: `auto repeat(${sortedPeriods.length}, minmax(60px, auto))`,
          gridTemplateColumns: `60px repeat(${structure.days.length}, 1fr)`,
        }}
      >
        <TopLeftCell />
        {structure.days.map((day) => (
          <DayHeaderCell key={day.id} isactive="true">
            {day.name.substring(0, 3)}
          </DayHeaderCell>
        ))}

        {sortedPeriods.map((period, pIndex) => (
          <React.Fragment key={period.id}>
            <TimeLabelCell sx={{ gridRow: pIndex + 2 }}>
              {period.start}
            </TimeLabelCell>
            {structure.days.map((day, dIndex) => (
              <BackgroundCell
                key={`${day.id}-${period.id}`}
                sx={{ gridRow: pIndex + 2, gridColumn: dIndex + 2 }}
              />
            ))}
          </React.Fragment>
        ))}

        {gridCells.map((cell) => renderCell(cell))}
      </GridContainer>
    </Paper>
  );
};

export default SchedulingGrid;
