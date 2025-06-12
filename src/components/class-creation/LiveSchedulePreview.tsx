import React, { useMemo } from "react";
import { Paper, Typography } from "@mui/material";
import { useClassCreationWizard } from "../../hooks/lecture/useClassCreationWizard.ts";
import { useTimetableData } from "../../hooks/timetable/useTimetableData.ts";

interface Props {
  wizard: ReturnType<typeof useClassCreationWizard>;
}

export const LiveSchedulePreview: React.FC<Props> = ({ wizard }) => {
  const { timetableId } = wizard;
  const { classes: existingClasses } = useTimetableData(timetableId);

  const teacherSchedule = useMemo(() => {
    if (!wizard.state.form.teacherId) return new Set<string>();
    const teacherClasses = existingClasses.filter(
      (c) => c.teacherDto?.id === wizard.state.form.teacherId,
    );
    const occupiedSlots = new Set<string>();
    teacherClasses.forEach((c) => {
      c.classOccurrences.forEach((occ) => {
        // Simplified key for preview purposes
        occupiedSlots.add(`${occ.date}_${occ.startPeriodId}`);
      });
    });
    return occupiedSlots;
  }, [wizard.state.form.teacherId, existingClasses]);

  return (
    <Paper elevation={2} sx={{ p: 2, height: "100%" }}>
      <Typography variant="h6" gutterBottom>
        Live Schedule Preview
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Teacher:{" "}
        {wizard.state.qualifiedTeachers.find(
          (t) => t.id === wizard.state.form.teacherId,
        )?.name || "Not Selected"}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {teacherSchedule.size} existing classes for this teacher.
      </Typography>
      {/*TODO: A full WeekView component would go here, using the 'teacherSchedule' set to disable or highlight
                conflicting slots.*/}
      <Typography
        variant="caption"
        sx={{ mt: 2, display: "block" }}
      ></Typography>
    </Paper>
  );
};
