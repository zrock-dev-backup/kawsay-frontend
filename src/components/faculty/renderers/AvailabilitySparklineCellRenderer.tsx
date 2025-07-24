import React from "react";
import { Box } from "@mui/material";
import { ICellRendererParams } from "ag-grid-community";
import { AvailabilitySparkline } from "../AvailabilitySparkline";
import { TeacherDto } from "../../../interfaces/teacherDtos";
import { TimetableStructure } from "../../../interfaces/timetableDtos";
import { useEffectiveAvailability } from "../../../hooks/faculty/useEffectiveAvailability";

interface SparklineCellRendererParams extends ICellRendererParams<TeacherDto> {
  masterTimetable: TimetableStructure;
  activeTimetable?: TimetableStructure;
  onToggleExpand?: (teacherId: number) => void;
}

export const AvailabilitySparklineCellRenderer: React.FC<
  SparklineCellRendererParams
> = ({
  data: teacher,
  masterTimetable,
  activeTimetable,
  onToggleExpand,
  node,
}) => {
  if (!teacher || !masterTimetable) {
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "text.secondary",
          fontSize: "0.875rem",
        }}
      >
        No data
      </Box>
    );
  }

  const isOverrideContext = !!activeTimetable;

  const { effectiveConstraintMap } = useEffectiveAvailability({
    defaultConstraints: teacher.defaultAvailabilityConstraints,
    timetableOverrides: teacher.timetableOverrides,
    activeTimetableId: isOverrideContext ? activeTimetable!.id : null,
  });

  const hasOverridesForTimetable = React.useMemo(() => {
    if (!isOverrideContext || !teacher.timetableOverrides || !activeTimetable) {
      return false;
    }

    const override = teacher.timetableOverrides.find(
      (override) => override.timetableId === activeTimetable.id,
    );

    return override && override.constraints && override.constraints.length > 0;
  }, [isOverrideContext, teacher.timetableOverrides, activeTimetable]);

  const handleCellClick = () => {
    if (!teacher?.id) return;
    if (onToggleExpand) {
      onToggleExpand(teacher.id);
      return;
    }
  };

  const tooltip = isOverrideContext
    ? `View/Edit ${activeTimetable!.name} Overrides`
    : "View/Edit Default Availability";

  if (isOverrideContext && !hasOverridesForTimetable) {
    return (
      <Box
        onClick={handleCellClick}
        sx={{
          cursor: "pointer",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "text.secondary",
          fontSize: "0.875rem",
          fontStyle: "italic",
          "&:hover": {
            backgroundColor: "action.hover",
          },
        }}
        title={tooltip}
      >
        No overrides
      </Box>
    );
  }

  return (
    <Box
      onClick={handleCellClick}
      sx={{
        cursor: "pointer",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        "&:hover": {
          backgroundColor: "action.hover",
        },
      }}
    >
      <AvailabilitySparkline
        constraintMap={effectiveConstraintMap}
        timetableStructure={
          isOverrideContext ? activeTimetable! : masterTimetable
        }
        tooltipTitle={tooltip}
      />
    </Box>
  );
};
