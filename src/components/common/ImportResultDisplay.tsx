import React from "react";
import {
  Alert,
  AlertTitle,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from "@mui/material";

interface ImportResult {
  processedCount: number;
  failedCount: number;
  errors: { csvRow: number; studentId?: number; error: string }[];
}

interface Props {
  result: ImportResult;
}

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
