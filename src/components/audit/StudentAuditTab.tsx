import React, { useState } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
} from "@mui/material";
import ViewComfyIcon from "@mui/icons-material/ViewComfy";
import ViewCompactIcon from "@mui/icons-material/ViewCompact";
import { StudentAuditGrid } from "./StudentAuditGrid";
import { IssueResolutionModal } from "./IssueResolutionModal";
import {
  UseStudentAuditActions,
  UseStudentAuditState,
} from "../../hooks/useStudentAudit";
import type { AuditStatusFilter } from "../../interfaces/auditDtos";

interface Props {
  auditState: UseStudentAuditState;
  auditActions: UseStudentAuditActions;
}

export const StudentAuditTab: React.FC<Props> = ({
  auditState: state,
  auditActions: actions,
}) => {
  const [density, setDensity] = useState<"comfortable" | "compact">(
    "comfortable",
  );

  const handleDensityChange = (
    event: React.MouseEvent<HTMLElement>,
    newDensity: "comfortable" | "compact" | null,
  ) => {
    if (newDensity !== null) {
      setDensity(newDensity);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          gap: 2,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={state.filter}
            label="Filter by Status"
            onChange={(e) =>
              actions.setFilter(e.target.value as AuditStatusFilter)
            }
          >
            <MenuItem value="All">All Students</MenuItem>
            <MenuItem value="ReadyToEnroll">Ready to Enroll</MenuItem>
            <MenuItem value="ActionRequired">Action Required</MenuItem>
            <MenuItem value="Enrolled">Enrolled</MenuItem>
          </Select>
        </FormControl>

        <ToggleButtonGroup
          value={density}
          exclusive
          onChange={handleDensityChange}
          aria-label="grid density"
          size="small"
        >
          <ToggleButton value="comfortable" aria-label="comfortable view">
            <ViewComfyIcon />
            <Typography
              variant="caption"
              sx={{ ml: 1, display: { xs: "none", sm: "block" } }}
            >
              Comfortable
            </Typography>
          </ToggleButton>
          <ToggleButton value="compact" aria-label="compact view">
            <ViewCompactIcon />
            <Typography
              variant="caption"
              sx={{ ml: 1, display: { xs: "none", sm: "block" } }}
            >
              Compact
            </Typography>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <StudentAuditGrid
        students={state.students}
        isLoading={state.isLoading}
        isBulkActionLoading={state.isBulkActionLoading}
        onResolveIssues={actions.openResolutionModal}
        onBulkConfirm={actions.confirmBulkEnrollment}
        onClearError={actions.clearError}
        resolvingStudentId={state.resolvingStudentId}
        density={density}
      />

      <IssueResolutionModal state={state} actions={actions} />
    </Box>
  );
};
