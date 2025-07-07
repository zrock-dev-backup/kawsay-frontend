import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Box,
  Typography,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import type { EligibilitySummary } from "../../interfaces/courseRequirementDtos";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  summary: EligibilitySummary | null;
}

export const EligibilityConfirmationDialog: React.FC<Props> = ({
  open,
  onClose,
  onConfirm,
  summary,
}) => {
  if (!summary) return null;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <InfoOutlinedIcon color="info" />
          <Typography variant="h6" component="span">
            Confirm Requirement Creation
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>The pre-flight check is complete.</DialogContentText>
        <Typography variant="body1" sx={{ mt: 2 }}>
          - <strong>{summary.eligible}</strong> of{" "}
          <strong>{summary.total}</strong> students are eligible.
          <br />- <strong>{summary.issues}</strong> student(s) have eligibility
          issues.
        </Typography>
        <DialogContentText sx={{ mt: 2, fontStyle: "italic" }}>
          Proceeding will create the requirement for the eligible students. The{" "}
          {summary.issues} student(s) with issues will be flagged for individual
          review in the 'Enrollment Audit' step.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} variant="contained" autoFocus>
          Proceed
        </Button>
      </DialogActions>
    </Dialog>
  );
};
