import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Button,
  CircularProgress,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/system";
import {
  useEffectiveAvailability,

} from "../../hooks/faculty/useEffectiveAvailability";
import { useAvailabilityGrid } from "../../hooks/faculty/useAvailabilityGrid";
import type { TeacherDto } from "../../interfaces/teacherDtos";
import type { TimetableStructure } from "../../interfaces/timetableDtos";
import type {
  TeacherAvailabilityConstraint,

} from "../../interfaces/availabilityDtos";
import { BaseTimetableGrid } from "../common/BaseTimetableGrid";

interface AvailabilityGridProps {
  teacher: TeacherDto;
  contextTimetable: TimetableStructure;
  masterTimetable: TimetableStructure;
  isOverrideContext: boolean;
  onSave: (
    teacherId: number,
    updatedTeacherData: Partial<TeacherDto>,
  ) => Promise<void>;
}

const getSlotKey = (dayId: number, periodId: number) => `${dayId}-${periodId}`;

export const AvailabilityGrid: React.FC<AvailabilityGridProps> = ({
  teacher,
  contextTimetable,
                                                                    isOverrideContext,
  onSave,
}) => {
  const theme = useTheme(); // Use theme for colors

  // Effective constraints for display (read-only, merged defaults + overrides)
  const { effectiveConstraintMap } = useEffectiveAvailability({
    defaultConstraints: teacher.defaultAvailabilityConstraints,
    timetableOverrides: teacher.timetableOverrides,
    activeTimetableId: isOverrideContext ? contextTimetable.id : null,
  });

  const [localConstraints, setLocalConstraints] = useState<
    TeacherAvailabilityConstraint[]
  >([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOverrideContext) {
      const override = teacher.timetableOverrides?.find(
        (o) => o.timetableId === contextTimetable.id,
      );
      setLocalConstraints(override?.constraints || []);
    } else {
      setLocalConstraints(teacher.defaultAvailabilityConstraints || []);
    }
  }, [teacher, contextTimetable, isOverrideContext]);

  const {
    selection,
    handleMouseDown,
    handleMouseEnter,
    handleMouseUp,
    handleUpdateConstraints,
  } = useAvailabilityGrid({
    initialConstraints: localConstraints,
    onConstraintsChange: setLocalConstraints,
    disabled: isSaving,
  });

  const handleSave = async () => {
    setIsSaving(true);
    let updatedData: Partial<TeacherDto>;

    if (isOverrideContext) {
      const otherOverrides =
        teacher.timetableOverrides?.filter(
          (o) => o.timetableId !== contextTimetable.id,
        ) || [];
      updatedData = {
        timetableOverrides: [
          ...otherOverrides,
          {
            timetableId: contextTimetable.id,
            constraints: localConstraints,
          },
        ],
      };
    } else {
      updatedData = { defaultAvailabilityConstraints: localConstraints };
    }

    await onSave(teacher.id, updatedData);
    setIsSaving(false);
  };

  const getSlotStyle = (dayId: number, periodId: number) => {
    const key = getSlotKey(dayId, periodId);
    const effective = effectiveConstraintMap.get(key);
    const isSelected = selection.has(key);

    let backgroundColor = theme.palette.action.disabledBackground; // Default available
    let border = "none";
    let backgroundImage = "none";

    // Determine base color from effective constraints
    if (effective) {
      if (effective.level === "Hard") {
        backgroundColor = alpha(theme.palette.error.main, 0.2);
        backgroundImage =
          "repeating-linear-gradient(-45deg, transparent, transparent 4px, rgba(0,0,0,0.05) 4px, rgba(0,0,0,0.05) 8px)";
      } else if (effective.level === "Soft") {
        backgroundColor = alpha(theme.palette.warning.main, 0.25);
      }
    }

    // Overlay selection style
    if (isSelected) {
      backgroundColor = alpha(theme.palette.primary.light, 0.5);
      border = `1px solid ${theme.palette.primary.main}`;
      backgroundImage = "none"; // Clear any background pattern if selected
    }

    return {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      cursor: isSaving ? "not-allowed" : "pointer",
      transition: theme.transitions.create("background-color", {
        duration: theme.transitions.duration.shortest,
      }),
      backgroundColor,
      border,
      backgroundImage,
      "&:hover": {
        backgroundColor: isSelected
          ? alpha(theme.palette.primary.light, 0.6)
          : alpha(theme.palette.action.hover, 0.8),
      },
    };
  };

  const renderSlot = (dayId: number, periodId: number) => {
    return (
      <Box
        onMouseDown={() => handleMouseDown(dayId, periodId)}
        onMouseEnter={() => handleMouseEnter(dayId, periodId)}
        sx={getSlotStyle(dayId, periodId)}
      />
    );
  };

  const title = isOverrideContext
    ? `Editing Overrides for ${contextTimetable.name}`
    : "Editing Default Availability";

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="h6">{title}</Typography>
          <Typography variant="body2" color="text.secondary">
            Paint on the grid below to set constraints for{" "}
            <strong>{teacher.fullName}</strong>.
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isSaving}
          startIcon={isSaving ? <CircularProgress size={16} /> : null}
        >
          Save Changes
        </Button>
      </Box>

      {selection.size > 0 && (
        <Paper elevation={3} sx={{ p: 1, mb: 2, display: "inline-block" }}>
          <ToggleButtonGroup size="small" exclusive>
            <ToggleButton
              value="Hard"
              onClick={() => handleUpdateConstraints(selection, "Hard")}
            >
              Unavailable
            </ToggleButton>
            <ToggleButton
              value="Soft"
              onClick={() => handleUpdateConstraints(selection, "Soft")}
            >
              Discouraged
            </ToggleButton>
            <ToggleButton
              value="Clear"
              onClick={() => handleUpdateConstraints(selection, null)} // Pass null for clear
            >
              Clear
            </ToggleButton>
          </ToggleButtonGroup>
        </Paper>
      )}

      <BaseTimetableGrid
        timetableStructure={contextTimetable}
        renderSlotContent={renderSlot}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </Paper>
  );
};
