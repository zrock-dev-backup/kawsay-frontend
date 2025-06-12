import React, { useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { CohortDetailDto } from "../../interfaces/academicStructureDtos";
import CreateStudentGroupForm from "./CreateStudentGroupForm";
import SectionManager from "./SectionManager";

interface StudentGroupManagerProps {
  cohort: CohortDetailDto;
  onAddGroup: (cohortId: number, groupName: string) => Promise<void>;
  onAddSection: (
    cohortId: number,
    groupId: number,
    sectionName: string,
  ) => Promise<void>;
}

const StudentGroupManager: React.FC<StudentGroupManagerProps> = ({
  cohort,
  onAddGroup,
  onAddSection,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateGroup = async (name: string) => {
    setIsSubmitting(true);
    await onAddGroup(cohort.id, name);
    setIsSubmitting(false);
  };

  return (
    <Box sx={{ width: "100%", pl: 4, pr: 2, py: 1 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
        Groups
      </Typography>

      {cohort.studentGroups.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>
          No student groups created for this cohort yet.
        </Typography>
      )}

      {cohort.studentGroups.map((group) => (
        <Accordion
          key={group.id}
          TransitionProps={{ unmountOnExit: true }}
          sx={{ my: 1, boxShadow: 1, "&:before": { display: "none" } }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ width: "50%", flexShrink: 0 }}>
              {group.name}
            </Typography>
            <Typography
              sx={{ color: "text.secondary" }}
            >{`ID: ${group.id} | Sections: ${group.sections.length}`}</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <SectionManager
              group={group}
              cohortId={cohort.id}
              onAddSection={onAddSection}
            />
          </AccordionDetails>
        </Accordion>
      ))}

      <CreateStudentGroupForm
        onSubmit={handleCreateGroup}
        isSubmitting={isSubmitting}
      />
    </Box>
  );
};

export default StudentGroupManager;
