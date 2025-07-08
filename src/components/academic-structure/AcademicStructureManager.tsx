import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useParams } from "react-router-dom";
import { useCohorts } from "../../hooks/useCohorts";
import { useAssignments } from "../../hooks/useAssignments";
import CohortList from "./CohortList";
import CreateCohortForm from "./CreateCohortForm";
import CohortDetailView from "./CohortDetailView";
import { AcademicStructureImporter } from "./AcademicStructureImporter";
import { AssignedFacultyList } from "./AssignedFacultyList";
import { AssignTeacherModal } from "./AssignTeacherModal";
import ConfirmationDialog from "../common/ConfirmationDialog.tsx";
import type { TimetableAssignmentDto } from "../../interfaces/teacherDtos";

const AcademicStructureManager: React.FC = () => {
  const { id: timetableId } = useParams<{ id: string }>();
  const {
    cohorts,
    isCohortsLoading,
    cohortsError,
    addCohort,
    addStudentGroup,
    addSection,
    reloadCohorts,
  } = useCohorts(timetableId);
  const {
    assignments,
    isAssignmentsLoading,
    assignmentsError,
    addAssignment,
    removeAssignment,
    reloadAssignments,
  } = useAssignments(timetableId);

  const [selectedCohortId, setSelectedCohortId] = useState<number | null>(null);
  const [isSubmittingCohort, setIsSubmittingCohort] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isAssignModalOpen, setAssignModalOpen] = useState(false);
  const [isSubmittingAssignment, setIsSubmittingAssignment] = useState(false);
  const [unassigningId, setUnassigningId] = useState<number | null>(null);

  const selectedCohort = cohorts.find((c) => c.id === selectedCohortId) || null;

  const reloadData = () => {
    reloadCohorts();
    reloadAssignments();
  };

  const handleCreateCohort = async (name: string) => {
    setIsSubmittingCohort(true);
    setFormError(null);
    try {
      const newCohort = await addCohort(name);
      if (newCohort) {
        setSelectedCohortId(newCohort.id);
      }
    } catch (e) {
      setFormError("Failed to create cohort.");
    }
    setIsSubmittingCohort(false);
  };

  const handleAssignSubmit = async (
    data: Omit<
      TimetableAssignmentDto,
      "assignmentId" | "teacherFullName" | "timetableId"
    >,
  ) => {
    setIsSubmittingAssignment(true);
    const success = await addAssignment(data);
    setIsSubmittingAssignment(false);
    return success;
  };

  const handleUnassignConfirm = async () => {
    if (unassigningId) {
      await removeAssignment(unassigningId);
      setUnassigningId(null);
    }
  };

  const handleAddGroup = (cohortId: number, groupName: string) =>
    addStudentGroup(cohortId, groupName);
  const handleAddSection = (
    cohortId: number,
    groupId: number,
    sectionName: string,
  ) => addSection(cohortId, groupId, sectionName);

  const isInitialLoading = isCohortsLoading && isAssignmentsLoading;
  const overallError = cohortsError || assignmentsError;

  if (isInitialLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <AcademicStructureImporter
        timetableId={timetableId!}
        onImportComplete={reloadData}
      />
      <Divider sx={{ my: 3 }}>
        <Typography variant="overline">OR MANAGE MANUALLY</Typography>
      </Divider>

      {overallError && (
        <Alert severity="error" sx={{ m: 2 }}>
          An error occurred: {overallError}
        </Alert>
      )}

      <Grid container spacing={4} sx={{ p: 2, height: "100%" }}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Box>
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
          </Box>
          <Box sx={{ mt: 4 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography variant="h6" gutterBottom>
                Assigned Faculty
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setAssignModalOpen(true)}
              >
                Assign
              </Button>
            </Box>
            <AssignedFacultyList
              assignments={assignments}
              onUnassign={setUnassigningId}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <CohortDetailView
            selectedCohort={selectedCohort}
            onAddGroup={handleAddGroup}
            onAddSection={handleAddSection}
          />
        </Grid>
      </Grid>

      <AssignTeacherModal
        open={isAssignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        onSubmit={handleAssignSubmit}
        existingAssignments={assignments}
        isSubmitting={isSubmittingAssignment}
      />
      <ConfirmationDialog
        open={!!unassigningId}
        onClose={() => setUnassigningId(null)}
        onConfirm={handleUnassignConfirm}
        title="Un-assign Teacher?"
        description="This will remove the teacher's contract for this timetable. They can be assigned again later. Are you sure?"
        confirmText="Un-assign"
        isLoading={isAssignmentsLoading}
      />
    </>
  );
};

export default AcademicStructureManager;
