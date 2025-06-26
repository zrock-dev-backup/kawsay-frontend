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
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useRequirementIssues } from "../../hooks/useRequirementIssues";

interface Props {
  open: boolean;
  onClose: () => void;
  requirementId: number | null;
  requirementName?: string;
}

export const RequirementIssuesModal: React.FC<Props> = ({
  open,
  onClose,
  requirementId,
  requirementName,
}) => {
  const { issues, isLoading, error } = useRequirementIssues(requirementId);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        Eligibility Issues for: {requirementName || "Requirement"}
      </DialogTitle>
      <DialogContent>
        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        )}
        {error && <Alert severity="error">{error}</Alert>}
        {!isLoading && !error && (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student Name</TableCell>
                  <TableCell>Issue Type</TableCell>
                  <TableCell>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {issues.map((issue) => (
                  <TableRow key={issue.studentId}>
                    <TableCell>{issue.studentName}</TableCell>
                    <TableCell>
                      <Typography variant="body2" color="error">
                        {issue.issueType}
                      </Typography>
                    </TableCell>
                    <TableCell>{issue.details}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
