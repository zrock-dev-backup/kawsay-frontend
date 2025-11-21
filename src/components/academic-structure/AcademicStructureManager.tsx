import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useParams } from "react-router-dom";
import { useCohorts } from "../../hooks/useCohorts";
import { useAssignments } from "../../hooks/useAssignments";
import CohortList from "./CohortList";
import CreateCohortForm from "./CreateCohortForm";
import CohortDetailView from "./CohortDetailView";
import { AssignedFacultyList } from "./AssignedFacultyList";
import { AssignTeacherModal } from "./AssignTeacherModal";
import ConfirmationDialog from "../common/ConfirmationDialog.tsx";
import type { TimetableAssignmentDto } from "../../interfaces/teacherDtos";
import { syncAcademicStructureFromSource } from "../../services/academicStructureApi.ts";
import type { AcademicStructureSyncResultDto } from "../../interfaces/syncDtos.ts";

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
  const [isSyncingRoster, setIsSyncingRoster] = useState(false);
  const [rosterSyncResult, setRosterSyncResult] =
    useState<AcademicStructureSyncResultDto | null>(null);
  const [rosterSyncError, setRosterSyncError] = useState<string | null>(null);

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

  const handleRosterSync = async () => {
    if (!timetableId) {
      setRosterSyncError("No timetable selected for roster sync.");
      return;
    }
    setIsSyncingRoster(true);
    setRosterSyncError(null);
    setRosterSyncResult(null);
    try {
      const result = await syncAcademicStructureFromSource(timetableId);
      setRosterSyncResult(result);
      await reloadData();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to sync roster from source.";
      setRosterSyncError(message);
    } finally {
      setIsSyncingRoster(false);
    }
  };

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
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
        >
          <Box>
            <Typography variant="h6">Live Roster Sync</Typography>
            <Typography variant="body2" color="text.secondary">
              Fetch the latest cohorts, groups, and sections directly from the
              source API. Existing records will be updated automatically.
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={handleRosterSync}
            disabled={!timetableId || isSyncingRoster}
            sx={{ minWidth: "220px" }}
          >
            {isSyncingRoster ? "Syncing..." : "Sync from SIS"}
          </Button>
        </Stack>
        {rosterSyncError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {rosterSyncError}
          </Alert>
        )}
        {rosterSyncResult && (
          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
              {rosterSyncResult.message}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Students processed: {rosterSyncResult.processedStudents} • New
              cohorts: {rosterSyncResult.cohortsCreated} • New groups:{" "}
              {rosterSyncResult.groupsCreated} • New sections:{" "}
              {rosterSyncResult.sectionsCreated}
            </Typography>
            {rosterSyncResult.warnings?.length ? (
              <Box component="ul" sx={{ pl: 3, mb: 0, mt: 1 }}>
                {rosterSyncResult.warnings.map((warning, index) => (
                  <li key={index}>
                    <Typography variant="body2" color="warning.main">
                      {warning}
                    </Typography>
                  </li>
                ))}
              </Box>
            ) : null}
          </Alert>
        )}
      </Paper>
      <Divider sx={{ my: 3 }}>
        <Typography variant="overline">MANAGE STRUCTURE</Typography>
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
