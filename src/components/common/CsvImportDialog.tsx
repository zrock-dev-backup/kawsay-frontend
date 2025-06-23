import React from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Typography,
} from "@mui/material";
import { useCsvImporter } from "../../hooks/useCsvImporter";
import { ImportResultDisplay } from "./ImportResultDisplay";
import type { IngestionResult } from "../../hooks/useEndOfModule"; // Assuming result format matches

interface Props {
  open: boolean;
  onClose: () => void;
  config: {
    endpoint: string;
    entityName: string;
  };
  onComplete: (result: IngestionResult | null) => void;
}

export const CsvImportDialog: React.FC<Props> = ({
  open,
  onClose,
  config,
  onComplete,
}) => {
  const { state, actions } = useCsvImporter(config);
  const { file, isParsing, isSubmitting, progress, result, error } = state;

  const handleClose = () => {
    onComplete(state.result as IngestionResult | null);
    actions.reset();
    onClose();
  };

  const isLoading = isParsing || isSubmitting;

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Bulk Import {config.entityName}s</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!isLoading && !result && (
          <Button variant="contained" component="label" sx={{ mt: 1 }}>
            {file ? `Selected: ${file.name}` : "Select CSV File"}
            <input
              type="file"
              hidden
              accept=".csv"
              onChange={(e) =>
                actions.handleFileSelect(e.target.files?.[0] || null)
              }
            />
          </Button>
        )}

        {isParsing && (
          <Box sx={{ width: "100%", mt: 2 }}>
            <Typography sx={{ mb: 1 }}>Parsing file...</Typography>
            <LinearProgress
              variant="determinate"
              value={progress ? (progress.processed / progress.total) * 100 : 0}
            />
          </Box>
        )}

        {isSubmitting && (
          <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
            <CircularProgress size={24} sx={{ mr: 2 }} />
            <Typography>Submitting data to server...</Typography>
          </Box>
        )}

        {result && <ImportResultDisplay result={result} />}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{result ? "Close" : "Cancel"}</Button>
        <Button
          onClick={actions.processImport}
          variant="contained"
          disabled={!file || isLoading}
        >
          {isLoading ? "Importing..." : "Start Import"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
