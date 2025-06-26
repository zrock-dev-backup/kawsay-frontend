import React from "react";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { IngestionResult } from "../../hooks/useEndOfModule";

interface Props {
  ingestionResult: IngestionResult;
  isPreparingProposals: boolean;
  onPrepareEnrollments: () => void;
}

export const EomSummaryReport: React.FC<Props> = ({
  ingestionResult,
  isPreparingProposals,
  onPrepareEnrollments,
}) => {
  return (
    <Paper variant="outlined" sx={{ p: 3, mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        EOM Analysis Report
      </Typography>

      <Typography variant="h6" sx={{ mt: 2 }}>
        Retake Demand
      </Typography>
      <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Course Code</TableCell>
              <TableCell align="right">Students Requiring Retake</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ingestionResult.retakeDemand.map((item) => (
              <TableRow key={item.courseCode}>
                <TableCell>{item.courseCode}</TableCell>
                <TableCell align="right">{item.studentCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h6">Advancing Cohorts</Typography>
      <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Cohort Name</TableCell>
              <TableCell align="right">Students Advancing</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ingestionResult.advancingCohorts.map((item) => (
              <TableRow key={item.cohortName}>
                <TableCell>{item.cohortName}</TableCell>
                <TableCell align="right">{item.studentCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          disabled={isPreparingProposals}
          onClick={onPrepareEnrollments}
        >
          {isPreparingProposals ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Step 2: Prepare Enrollments for Next Module"
          )}
        </Button>
      </Box>
    </Paper>
  );
};
