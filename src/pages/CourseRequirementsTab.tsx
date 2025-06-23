import React, { useEffect } from "react";
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

interface Props {
  timetableId: string;
}

const CourseRequirementsTab: React.FC<Props> = ({ timetableId }) => {
  const { requirements, isLoading, error, fetchRequirements } =
    useCourseRequirementStore();

  useEffect(() => {
    if (timetableId) {
      fetchRequirements(Number(timetableId));
    }
  }, [timetableId, fetchRequirements]);

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 5 }}>
        <Paper sx={{ p: 2, height: "100%" }}>
          <Typography variant="h6" gutterBottom>
            Add New Requirement
          </Typography>
          <CourseRequirementForm timetableId={Number(timetableId)} />
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, md: 7 }}>
        <Paper sx={{ p: 2, height: "100%" }}>
          <Typography variant="h6" gutterBottom>
            Current Requirements
          </Typography>
          {isLoading && <CircularProgress />}
          {error && <Alert severity="error">{error}</Alert>}
          {!isLoading && !error && (
            <CourseRequirementList requirements={requirements} />
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default CourseRequirementsTab;
