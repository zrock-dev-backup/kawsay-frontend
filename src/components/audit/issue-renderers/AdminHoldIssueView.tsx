import React from "react";
import { Alert, AlertTitle } from "@mui/material";
import type { AdminHoldIssueContext } from "../../../interfaces/issueDtos";

interface Props {
  context: AdminHoldIssueContext;
}

export const AdminHoldIssueView: React.FC<Props> = ({ context }) => {
  return (
    <Alert severity="warning">
      <AlertTitle>Administrative Hold</AlertTitle>
      {context.holdReason} - This issue must typically be resolved outside of
      the enrollment system.
    </Alert>
  );
};
