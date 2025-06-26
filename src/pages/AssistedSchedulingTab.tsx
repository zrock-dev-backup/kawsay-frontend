import React, { useEffect, useMemo, useState } from "react";
import {
  Grid,
  Typography,
  Alert,
  Button,
  CircularProgress,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useSchedulingStore } from "../stores/useSchedulingStore.ts";
import UnscheduledList from "../components/scheduling/UnscheduledList.tsx";
import SchedulingGrid from "../components/scheduling/SchedulingGrid.tsx";
import { useCourseRequirementStore } from "../stores/useCourseRequirementStore.ts";
import type { CourseRequirementDto } from "../interfaces/courseRequirementDtos.ts";
import RequirementDetailsModal from "../components/requirements/RequirementDetailsModal.tsx";
import ConfirmationDialog from "../components/common/ConfirmationDialog.tsx";
import { useTimetableStore } from "../stores/useTimetableStore.ts";
import { useStudentAudit } from "../hooks/useStudentAudit.ts";

const AssistedSchedulingTab: React.FC = () => {
  const { requirements } = useCourseRequirementStore();
  const {
    stagedPlacements,
    isFinalizing,
    error,
    reset,
    finalizeSchedule,
    lastFinalizationResult,
    clearFinalizationResult,
  } = useSchedulingStore();
  const { structure, refreshData, setWizardStep } = useTimetableStore();
  const timetableId = structure?.id;
  const isWizardMode = structure?.status === "Draft";

  const studentAuditHook = useStudentAudit(timetableId?.toString() ?? "");

  const [viewingRequirement, setViewingRequirement] =
    useState<CourseRequirementDto | null>(null);
  const [isConfirmingFinalize, setIsConfirmingFinalize] = useState(false);

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  const unscheduledCount = useMemo(() => {
    const stagedIds = new Set(
      stagedPlacements.map((p) => p.courseRequirementId),
    );
    return requirements.filter((r) => !stagedIds.has(r.id)).length;
  }, [requirements, stagedPlacements]);

  const handleFinalize = async () => {
    if (!timetableId) return;
    setIsConfirmingFinalize(false);

    const success = await finalizeSchedule(timetableId);

    if (success && isWizardMode) {
      await studentAuditHook.actions.refetch();
    } else if (success && !isWizardMode) {
      refreshData();
    }
  };

  const handleProceedToAudit = () => {
    clearFinalizationResult();
    setWizardStep(3);
  };

  if (lastFinalizationResult && !isWizardMode) {
    return (
      <Alert severity="success" sx={{ m: 2 }}>
        <Typography variant="h6">Schedule Finalized!</Typography>
        {lastFinalizationResult.message}
      </Alert>
    );
  }

  return (
    <>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant="h5">Assisted Scheduling Workspace</Typography>
        <Button
          variant="contained"
          color="success"
          startIcon={
            isFinalizing ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <AutoAwesomeIcon />
            )
          }
          disabled={
            unscheduledCount !== 0 ||
            stagedPlacements.length === 0 ||
            isFinalizing
          }
          onClick={() => setIsConfirmingFinalize(true)}
        >
          {isWizardMode ? "Finalize & Proceed" : "Finalize Schedule"}
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Grid container spacing={2} sx={{ height: "75vh" }}>
        <Grid size={{ xs: 12, md: 4 }} sx={{ height: "100%" }}>
          <Typography variant="h6" gutterBottom>
            Unscheduled ({unscheduledCount})
          </Typography>
          <UnscheduledList onViewDetails={setViewingRequirement} />
        </Grid>
        <Grid size={{ xs: 12, md: 8 }} sx={{ height: "100%" }}>
          <Typography variant="h6" gutterBottom>
            Scheduling Grid
          </Typography>
          <SchedulingGrid onViewDetails={setViewingRequirement} />
        </Grid>
      </Grid>

      <RequirementDetailsModal
        requirement={viewingRequirement}
        open={!!viewingRequirement}
        onClose={() => setViewingRequirement(null)}
      />
      <ConfirmationDialog
        open={isConfirmingFinalize}
        onClose={() => setIsConfirmingFinalize(false)}
        onConfirm={handleFinalize}
        title="Finalize and Commit Schedule?"
        description={`You are about to finalize the schedule with ${stagedPlacements.length} classes. This will create the classes and generate enrollment proposals for students.`}
        confirmText="Finalize"
        isLoading={isFinalizing}
      />
      {/* --- Wizard Transition Modal --- */}
      <Dialog open={!!lastFinalizationResult && isWizardMode}>
        <DialogTitle>Step Complete: Schedule Built</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {lastFinalizationResult?.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleProceedToAudit} variant="contained">
            Proceed to Enrollment Audit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AssistedSchedulingTab;
