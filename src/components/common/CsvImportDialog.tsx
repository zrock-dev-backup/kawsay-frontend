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
import type { StructureBulkImportResultDto } from "../../interfaces/bulkImportDtos";

interface Props {
  open: boolean;
  onClose: () => void;
  entityName: string;
  templatePath: string;
  // State props
  file: File | null;
  isParsing: boolean;
  isSubmitting: boolean;
  result: StructureBulkImportResultDto | null;
  error: string | null;
  // Action props
  onFileSelect: (file: File | null) => void;
  onProcessImport: () => void;
}

export const CsvImportDialog: React.FC<Props> = ({
  open,
  onClose,
  entityName,
  templatePath,
  file,
  isParsing,
  isSubmitting,
  result,
  error,
  onFileSelect,
  onProcessImport,
}) => {
  const isLoading = isParsing || isSubmitting;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
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
              onChange={(e) => onFileSelect(e.target.files?.[0] || null)}
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
        <Button onClick={onClose}>{result ? "Close" : "Cancel"}</Button>
        {!result && (
          <Button
            onClick={onProcessImport}
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
