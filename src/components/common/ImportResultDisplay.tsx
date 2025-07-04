import React from "react";
import {
  Alert,
  AlertTitle,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { StructureBulkImportResultDto } from "../../interfaces/bulkImportDtos";

interface Props {
  result: StructureBulkImportResultDto;
}

const SummaryList: React.FC<{
  title: string;
  data: { created: string[]; found: string[] };
}> = ({ title, data }) => (
  <Box sx={{ mb: 1 }}>
    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
      {title}
    </Typography>
    {data.created.length > 0 && (
      <Typography variant="body2" color="success.dark">
        Created: {data.created.join(", ")}
      </Typography>
    )}
    {data.found.length > 0 && (
      <Typography variant="body2" color="text.secondary">
        Found: {data.found.join(", ")}
      </Typography>
    )}
    {data.created.length === 0 && data.found.length === 0 && (
      <Typography variant="body2" color="text.secondary">
        None
      </Typography>
    )}
  </Box>
);

export const ImportResultDisplay: React.FC<Props> = ({ result }) => {
  const hasErrors = result.failedCount > 0;

  return (
    <Box sx={{ mt: 2 }}>
      <Alert severity={hasErrors ? "warning" : "success"}>
        <AlertTitle>Import Complete</AlertTitle>
        Successfully processed: {result.processedCount} row(s).
        <br />
        Failed: {result.failedCount} row(s).
      </Alert>

      {result.summary && (
        <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
          <SummaryList title="Cohorts" data={result.summary.cohorts} />
          <SummaryList title="Groups" data={result.summary.groups} />
          <SummaryList title="Sections" data={result.summary.sections} />
        </Paper>
      )}

      {hasErrors && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Error Details
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>CSV Row</TableCell>
                  <TableCell>Error Message</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {result.errors.map((err, index) => (
                  <TableRow key={index}>
                    <TableCell>{err.csvRow}</TableCell>
                    <TableCell sx={{ color: "error.main" }}>
                      {err.error}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
};
