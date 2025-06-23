import React from "react";
import { useParams } from "react-router-dom";
import { Alert, Button, Container, Paper, Typography } from "@mui/material";
import { useEndOfModule } from "../hooks/useEndOfModule";
import { CsvImportDialog } from "../components/common/CsvImportDialog";
import { EomSummaryReport } from "../components/eom/EomSummaryReport";
import { API_BASE_URL } from "../services/api.helpers";

export const EndOfModulePage: React.FC = () => {
  const { timetableId } = useParams<{ timetableId: string }>();

  const destinationTimetableId = timetableId
    ? (parseInt(timetableId, 10) + 1).toString()
    : "";

  if (!timetableId) {
    return (
      <Alert severity="error">Timetable ID is missing from the URL.</Alert>
    );
  }

  const { state, actions } = useEndOfModule(timetableId);
  const importConfig = {
    endpoint: `${API_BASE_URL}/eom/${timetableId}/ingest-grades`,
    entityName: "Final Grades",
  };

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
        <Typography variant="h6">Step 1: Ingest Final Grade Data</Typography>
        <Button
          variant="contained"
          onClick={actions.openImportDialog}
          sx={{ mt: 2 }}
        >
          Import Grades CSV
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

      <CsvImportDialog
        open={state.isImportDialogOpen}
        onClose={actions.closeImportDialog}
        onComplete={actions.handleIngestionComplete}
        config={importConfig}
      />
    </Container>
  );
};

export default EndOfModulePage;
