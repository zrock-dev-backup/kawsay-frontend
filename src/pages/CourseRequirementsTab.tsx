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
import ConfirmationDialog from "../components/common/ConfirmationDialog.tsx";

interface Props {
  timetableId: string;
}

const CourseRequirementsTab: React.FC<Props> = ({ timetableId }) => {
  const {
    requirements,
    isLoading,
    error,
    fetchRequirements,
    deleteRequirement,
  } = useCourseRequirementStore();
  const [editingRequirement, setEditingRequirement] =
    useState<CourseRequirementDto | null>(null);
  const [requirementToDelete, setRequirementToDelete] =
    useState<CourseRequirementDto | null>(null);

  useEffect(() => {
    if (timetableId) {
      fetchRequirements(Number(timetableId));
    }
  }, [timetableId, fetchRequirements]);

  const handleCancelEdit = () => {
    setEditingRequirement(null);
  };

  const handleDeleteRequest = (requirement: CourseRequirementDto) => {
    setRequirementToDelete(requirement);
  };

  const handleConfirmDelete = async () => {
    if (!requirementToDelete) return;
    await deleteRequirement(requirementToDelete.id);
    if (editingRequirement?.id === requirementToDelete.id) {
      setEditingRequirement(null);
    }
    setRequirementToDelete(null);
  };

  return (
    <>
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
                onDelete={handleDeleteRequest}
              />
            )}
          </Paper>
        </Grid>
      </Grid>

      <ConfirmationDialog
        open={!!requirementToDelete}
        onClose={() => setRequirementToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        description={`Are you sure you want to delete the requirement for "${requirementToDelete?.courseName}"? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={isLoading}
      />
    </>
  );
};

export default CourseRequirementsTab;
