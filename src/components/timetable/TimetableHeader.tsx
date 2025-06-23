import React from "react";
import {
  Button,
  CircularProgress,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useCalendarControls } from "../../hooks/timetable/useCalendarControls.ts";

interface TimetableHeaderProps {
  calendarControls: ReturnType<typeof useCalendarControls>;
  isGenerating: boolean;
  onGenerate: () => void;
}

const isTimetableGenerated = true;
const TimetableHeader: React.FC<TimetableHeaderProps> = ({
  calendarControls,
  isGenerating,
  onGenerate,
}) => {
  const {
    view,
    displayDate,
    handleViewChange,
    handlePrev,
    handleNext,
    handleToday,
  } = calendarControls;

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{ mb: 2, flexWrap: "wrap", gap: 2 }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        {view && (
          <>
            <IconButton onClick={handlePrev} aria-label="previous period">
              <ChevronLeftIcon />
            </IconButton>
            <Button variant="outlined" onClick={handleToday}>
              Today
            </Button>
            <IconButton onClick={handleNext} aria-label="next period">
              <ChevronRightIcon />
            </IconButton>
            <Typography variant="h6">
              {view === "week"
                ? displayDate.format("MMM D, YYYY")
                : displayDate.format("MMMM YYYY")}
            </Typography>
          </>
        )}
      </Stack>
      <Stack direction="row" spacing={1} alignItems="center">
        {view && (
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={handleViewChange}
            size="small"
          >
            <ToggleButton value="week">Week</ToggleButton>
            <ToggleButton value="month">Month</ToggleButton>
          </ToggleButtonGroup>
        )}
        {isTimetableGenerated &&
            <Button
                variant="contained"
                startIcon={
                  isGenerating ? <CircularProgress size={20} /> : <AutoAwesomeIcon />
                }
                onClick={onGenerate}
                disabled={true}
            >
              {isGenerating ? "Generating..." : "Generate Schedule"}
            </Button>
        }
      </Stack>
    </Stack>
  );
};

export default TimetableHeader;
