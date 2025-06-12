import React, { useState } from "react";
import { Alert, Box, CircularProgress, Grid, Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import { useAcademicStructure } from "../../hooks/useAcademicStructure";
import CohortList from "./CohortList";
import CreateCohortForm from "./CreateCohortForm";
import CohortDetailView from "./CohortDetailView";

const AcademicStructureManager: React.FC = () => {
  const { id: timetableId } = useParams<{ id: string }>();
  const { cohorts, loading, error, addCohort, addStudentGroup, addSection } =
    useAcademicStructure(timetableId);

  // State for the Master-Detail view
  const [selectedCohortId, setSelectedCohortId] = useState<number | null>(null);

  const [isSubmittingCohort, setIsSubmittingCohort] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Find the currently selected cohort object
  const selectedCohort = cohorts.find((c) => c.id === selectedCohortId) || null;

  const handleCreateCohort = async (name: string) => {
    setIsSubmittingCohort(true);
    setFormError(null);
    const newCohort = await addCohort(name);
    if (newCohort) {
      // Automatically select the new cohort after creation
      setSelectedCohortId(newCohort.id);
    } else {
      setFormError(
        "Failed to create the cohort. Please check the console for details.",
      );
    }
    setIsSubmittingCohort(false);
  };

  const handleAddGroup = (cohortId: number, groupName: string) =>
    addStudentGroup(cohortId, groupName);
  const handleAddSection = (
    cohortId: number,
    groupId: number,
    sectionName: string,
  ) => addSection(cohortId, groupId, sectionName);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        An error occurred: {error}
      </Alert>
    );
  }

  return (
    <Grid container spacing={2} sx={{ p: 2, height: "100%" }}>
      {/* Master Pane */}
      <Grid item xs={12} md={4}>
        <Typography variant="h6" gutterBottom>
          Cohorts
        </Typography>
        <Box sx={{ mb: 2 }}>
          <CreateCohortForm
            onSubmit={handleCreateCohort}
            isSubmitting={isSubmittingCohort}
          />
          {formError && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {formError}
            </Alert>
          )}
        </Box>
        <CohortList
          cohorts={cohorts}
          selectedCohortId={selectedCohortId}
          onSelectCohort={setSelectedCohortId}
        />
      </Grid>
      {/* Detail Pane */}
      <Grid item xs={12} md={8}>
        <CohortDetailView
          selectedCohort={selectedCohort}
          onAddGroup={handleAddGroup}
          onAddSection={handleAddSection}
        />
      </Grid>
    </Grid>
  );
};

export default AcademicStructureManager;
