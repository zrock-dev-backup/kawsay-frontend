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
  Link,
  Typography,
} from "@mui/material";
import { ImportResultDisplay } from "./ImportResultDisplay";

interface Props {
  open: boolean;
  onClose: () => void;
  importer: ReturnType<
    typeof import("../../hooks/useCsvImporter").useCsvImporter
  >;
  entityName: string;
  templatePath: string;
}

export const CsvImportDialog: React.FC<Props> = ({
  open,
  onClose,
  importer,
  entityName,
  templatePath,
}) => {
  const { state, actions } = importer;
  const { file, isParsing, isSubmitting, result, error } = state;

  const handleClose = () => {
    actions.reset();
    onClose();
  };

  const isLoading = isParsing || isSubmitting;

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Bulk Import {entityName}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!result && (
          <Typography variant="body2" sx={{ mb: 2 }}>
            Upload a CSV file to bulk create {entityName}. Please ensure the
            file follows the structure of the provided template.
            <br />
            <Link href={templatePath} download>
              Download Template
            </Link>
          </Typography>
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

        {(isParsing || isSubmitting) && (
          <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
            <CircularProgress size={24} sx={{ mr: 2 }} />
            <Typography>
              {isParsing ? "Parsing file..." : "Submitting data to server..."}
            </Typography>
          </Box>
        )}

        {result && <ImportResultDisplay result={result} />}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{result ? "Close" : "Cancel"}</Button>
        {!result && (
          <Button
            onClick={actions.processImport}
            variant="contained"
            disabled={!file || isLoading}
          >
            {isLoading ? "Importing..." : "Start Import"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
