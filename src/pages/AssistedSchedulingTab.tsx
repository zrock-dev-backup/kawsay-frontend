import React, { useEffect, useState, useMemo } from "react";
import {
  Grid,
  Typography,
  Alert,
  Button,
  CircularProgress,
  Stack,
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

const AssistedSchedulingTab: React.FC = () => {
  const { requirements } = useCourseRequirementStore();
  const { stagedPlacements, isFinalizing, error, reset, finalizeSchedule } =
    useSchedulingStore();
  const refreshTimetableData = useTimetableStore((state) => state.refreshData);
  const timetableId = useTimetableStore((state) => state.structure?.id);

  const [viewingRequirement, setViewingRequirement] =
    useState<CourseRequirementDto | null>(null);
  const [isConfirmingFinalize, setIsConfirmingFinalize] = useState(false);
  const [finalizationResult, setFinalizationResult] = useState<string | null>(
    null,
  );

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
    const result = await finalizeSchedule(timetableId);
    if (result) {
      setFinalizationResult(result);
      refreshTimetableData(); // Refresh the main timetable view with new classes
    }
    setIsConfirmingFinalize(false);
  };

  if (finalizationResult) {
    return (
      <Alert severity="success" sx={{ m: 2 }}>
        <Typography variant="h6">Schedule Finalized!</Typography>
        {finalizationResult}
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
          Finalize Schedule
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
        description={`You are about to finalize the schedule with ${stagedPlacements.length} classes. This action cannot be undone.`}
        confirmText="Finalize"
        isLoading={isFinalizing}
      />
    </>
  );
};

export default AssistedSchedulingTab;
