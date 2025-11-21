import React from "react";
import { useParams } from "react-router-dom";
import { Alert, Button, Container, Paper, Typography } from "@mui/material";
import { useEndOfModule } from "../hooks/useEndOfModule";
import { EomSummaryReport } from "../components/eom/EomSummaryReport";

export const EndOfModulePage: React.FC = () => {
  const { timetableId } = useParams<{ timetableId: string }>();
  const safeTimetableId = timetableId ?? "";
  const { state, actions } = useEndOfModule(safeTimetableId);

  const destinationTimetableId = timetableId
    ? (parseInt(timetableId, 10) + 1).toString()
    : "";

  if (!timetableId) {
    return (
      <Alert severity="error">Timetable ID is missing from the URL.</Alert>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        End-of-Module Processing
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        Processing Module: {timetableId} → Preparing for Module:{" "}
        {destinationTimetableId}
      </Typography>

      {state.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {state.error}
        </Alert>
      )}
      {state.proposalResult && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {state.proposalResult.message}
        </Alert>
      )}

      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6">Step 1: Sync Final Grade Data</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Trigger a sync whenever the latest results are available.
        </Typography>
        <Button
          variant="contained"
          onClick={actions.syncGradesFromSource}
          disabled={state.isSyncingGrades}
          sx={{ mt: 2 }}
        >
          {state.isSyncingGrades ? "Syncing..." : "Sync Grades from LMS"}
        </Button>
      </Paper>

      {state.ingestionResult && (
        <EomSummaryReport
          ingestionResult={state.ingestionResult}
          isPreparingProposals={state.isPreparingProposals}
          onPrepareEnrollments={() =>
            actions.prepareEnrollments(destinationTimetableId)
          }
        />
      )}
    </Container>
  );
};

export default EndOfModulePage;
