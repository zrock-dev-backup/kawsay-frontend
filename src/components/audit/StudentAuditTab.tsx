import React from "react";
import { Box, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { StudentAuditGrid } from "./StudentAuditGrid";
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
  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
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
      </Box>

      <StudentAuditGrid
        students={state.students}
        isLoading={state.isLoading}
        isBulkActionLoading={state.isBulkActionLoading}
        isResolveActionLoading={state.isResolveActionLoading}
        error={state.error}
        onResolveIssues={actions.resolveStudentIssues}
        onBulkConfirm={actions.confirmBulkEnrollment}
        onClearError={actions.clearError}
      />
    </Box>
  );
};
