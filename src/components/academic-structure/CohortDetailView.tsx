import React from "react";
import { Paper, Typography } from "@mui/material";
import type { CohortDetailDto } from "../../interfaces/academicStructureDtos";
import StudentGroupManager from "./StudentGroupManager";

interface CohortDetailViewProps {
  selectedCohort: CohortDetailDto | null;
  onAddGroup: (cohortId: number, groupName: string) => Promise<void>;
  onAddSection: (
    cohortId: number,
    groupId: number,
    sectionName: string,
  ) => Promise<void>;
}

const CohortDetailView: React.FC<CohortDetailViewProps> = ({
  selectedCohort,
  onAddGroup,
  onAddSection,
}) => {
  if (!selectedCohort) {
    return (
      <Paper
        sx={{
          p: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <Typography color="text.secondary">
          Select a cohort from the list to view and manage its groups.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Cohort: {selectedCohort.name}
      </Typography>
      <StudentGroupManager
        cohort={selectedCohort}
        onAddGroup={onAddGroup}
        onAddSection={onAddSection}
      />
    </Paper>
  );
};

export default CohortDetailView;
