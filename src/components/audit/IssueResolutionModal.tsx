import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import type {
  UseStudentAuditActions,
  UseStudentAuditState,
} from "../../hooks/useStudentAudit";
import { AdminHoldIssueView } from "./issue-renderers/AdminHoldIssueView";
import { PrerequisiteIssueView } from "./issue-renderers/PrerequisiteIssueView";
import { TimeClashIssueView } from "./issue-renderers/TimeClashIssueView";
import type {
  AdminHoldIssueContext,
  PrerequisiteIssueContext,
  TimeClashIssueContext,
} from "../../interfaces/issueDtos";

interface Props {
  state: UseStudentAuditState;
  actions: UseStudentAuditActions;
}

export const IssueResolutionModal: React.FC<Props> = ({ state, actions }) => {
  const {
    isResolutionModalOpen,
    studentForResolution,
    issueDetails,
    isSubmittingResolution,
    resolutionError,
      resolvingStudentId,
  } = state;

  // Local state to manage UI selections within the modal
  const [selectedAlternativeClassId, setSelectedAlternativeClassId] = useState<
    number | null
  >(null);

  const handleClose = () => {
    setSelectedAlternativeClassId(null);
    actions.closeResolutionModal();
  };

  const handleSubmit = (
    issueId: string,
    action: "SelectAlternative" | "Override" | "Acknowledge" | "ForceEnroll",
  ) => {
    actions.submitResolution({
      issueId,
      action,
      data: { selectedClassId: selectedAlternativeClassId ?? undefined },
    });
  };

  const renderIssueContent = (issue: (typeof issueDetails)[0]) => {
    switch (issue.issueType) {
      case "Prerequisite":
        return (
          <PrerequisiteIssueView
            context={issue.context as PrerequisiteIssueContext}
          />
        );
      case "TimeClash":
        return (
          <TimeClashIssueView
            context={issue.context as TimeClashIssueContext}
            selectedValue={selectedAlternativeClassId}
            onSelectionChange={setSelectedAlternativeClassId}
          />
        );
      case "AdminHold":
        return (
          <AdminHoldIssueView
            context={issue.context as AdminHoldIssueContext}
          />
        );
      default:
        return (
          <Typography>Unsupported issue type: {issue.issueType}</Typography>
        );
    }
  };

  return (
    <Dialog
      open={isResolutionModalOpen}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        Resolve Issues for: {studentForResolution?.studentName}
        {resolvingStudentId === studentForResolution?.studentId && <CircularProgress size={20} sx={{ ml: 2 }} />}
      </DialogTitle>
      <DialogContent>
        {resolutionError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {resolutionError}
          </Alert>
        )}

        {!(resolvingStudentId === studentForResolution?.studentId) && issueDetails.length > 0 && (
          <Stack spacing={3} divider={<Divider />}>
            {issueDetails.map((issue) => (
              <Box key={issue.issueId} sx={{ pt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {issue.issueType}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {issue.message}
                </Typography>
                {renderIssueContent(issue)}

                <DialogActions>
                  {issue.availableActions.map((action) => {
                    const isSelectAlternative = action === "SelectAlternative";
                    return (
                      <Button
                        key={action}
                        onClick={() => handleSubmit(issue.issueId, action)}
                        variant={isSelectAlternative ? "contained" : "outlined"}
                        disabled={
                          isSubmittingResolution ||
                          (isSelectAlternative && !selectedAlternativeClassId)
                        }
                      >
                        {isSubmittingResolution ? (
                          <CircularProgress size={24} />
                        ) : (
                          action.replace(/([A-Z])/g, " $1").trim()
                        )}
                      </Button>
                    );
                  })}
                </DialogActions>
              </Box>
            ))}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmittingResolution}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
