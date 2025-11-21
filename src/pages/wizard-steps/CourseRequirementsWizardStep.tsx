import React from "react";
import {
  Alert,
  Box,
  Button,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import CourseRequirementsTab from "../CourseRequirementsTab";
import { useCourseRequirementStore } from "../../stores/useCourseRequirementStore";

interface Props {
  timetableId: string;
}

const CourseRequirementsWizardStep: React.FC<Props> = ({ timetableId }) => {
  const timetableNumericId = Number(timetableId);
  const {
    syncRequirementsFromSource,
    isSyncingFromSource,
    syncError,
    lastSyncResult,
  } = useCourseRequirementStore((state) => ({
    syncRequirementsFromSource: state.syncRequirementsFromSource,
    isSyncingFromSource: state.isSyncingFromSource,
    syncError: state.syncError,
    lastSyncResult: state.lastSyncResult,
  }));

  const handleSync = async () => {
    if (!timetableNumericId) {
      return;
    }
    await syncRequirementsFromSource(timetableNumericId);
  };

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
            <Typography variant="h6">Sync Course Requirements</Typography>
            <Typography variant="body2" color="text.secondary">
              Pull the latest requirement definitions from the academic rules
              API. Newly discovered items are added automatically and existing
              entries stay up to date.
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={handleSync}
            disabled={!timetableNumericId || isSyncingFromSource}
            sx={{ minWidth: "220px" }}
          >
            {isSyncingFromSource ? "Syncing..." : "Sync from API"}
          </Button>
        </Stack>
        {syncError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {syncError}
          </Alert>
        )}
        {lastSyncResult && (
          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
              {lastSyncResult.message}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Created: {lastSyncResult.requirementsCreated} • Updated:{" "}
              {lastSyncResult.requirementsUpdated} • Skipped:{" "}
              {lastSyncResult.skipped}
            </Typography>
            {lastSyncResult.warnings?.length ? (
              <Box component="ul" sx={{ pl: 3, mb: 0, mt: 1 }}>
                {lastSyncResult.warnings.map((warning, index) => (
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
        <Typography variant="overline">MANAGE REQUIREMENTS</Typography>
      </Divider>

      <CourseRequirementsTab timetableId={timetableId} />
    </>
  );
};

export default CourseRequirementsWizardStep;
