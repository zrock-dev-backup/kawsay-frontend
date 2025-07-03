import React from "react";
import { Button, CircularProgress } from "@mui/material";
import type { StudentAuditDto } from "../../interfaces/auditDtos";
import { AUDIT_STATUS_CONFIG } from "../../utils/auditConfig";

interface Props {
  student: StudentAuditDto;
  isLoading: boolean;
  onAction: (studentId: number) => void;
}

export const StudentActionButton: React.FC<Props> = React.memo(
  ({ student, isLoading, onAction }) => {
    const config = AUDIT_STATUS_CONFIG[student.status];

    if (!config.actionLabel) return null;

    return (
      <Button
        variant="text"
        size="small"
        disabled={isLoading}
        onClick={() => onAction(student.studentId)}
        startIcon={isLoading ? <CircularProgress size={16} /> : undefined}
        aria-label={`${config.actionLabel} for ${student.studentName}`}
      >
        {config.actionLabel}
      </Button>
    );
  },
);

StudentActionButton.displayName = "StudentActionButton";
