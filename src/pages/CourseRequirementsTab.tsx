import React, { useEffect, useState } from "react";
import {
  Alert,
  CircularProgress,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import { useCourseRequirementStore } from "../stores/useCourseRequirementStore";
import CourseRequirementList from "../components/requirements/CourseRequirementList";
import CourseRequirementForm from "../components/requirements/CourseRequirementForm.tsx";
import type { CourseRequirementDto } from "../interfaces/courseRequirementDtos.ts";

interface Props {
  timetableId: string;
}

const CourseRequirementsTab: React.FC<Props> = ({ timetableId }) => {
  const { requirements, isLoading, error, fetchRequirements } =
    useCourseRequirementStore();
  const [editingRequirement, setEditingRequirement] =
    useState<CourseRequirementDto | null>(null);

  useEffect(() => {
    if (timetableId) {
      fetchRequirements(Number(timetableId));
    }
  }, [timetableId, fetchRequirements]);

  const handleCancelEdit = () => {
    setEditingRequirement(null);
  };

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 5 }}>
        <Paper sx={{ p: 2, height: "100%" }}>
          <CourseRequirementForm
            timetableId={Number(timetableId)}
            requirementToEdit={editingRequirement}
            onCancelEdit={handleCancelEdit}
          />
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, md: 7 }}>
        <Paper sx={{ p: 2, height: "100%" }}>
          <Typography variant="h6" gutterBottom>
            Current Requirements
          </Typography>
          {isLoading && requirements.length === 0 ? (
            <CircularProgress />
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <CourseRequirementList
              requirements={requirements}
              onEdit={setEditingRequirement}
            />
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default CourseRequirementsTab;
