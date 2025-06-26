import React, { useState } from "react";
import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import type { CourseRequirementDto } from "../../interfaces/courseRequirementDtos";
import { RequirementIssuesModal } from "./RequirementIssuesModal";
import { useCourseRequirementStore } from "../../stores/useCourseRequirementStore";

interface Props {
  requirements: CourseRequirementDto[];
  onEdit: (requirement: CourseRequirementDto) => void;
  onDelete: (requirement: CourseRequirementDto) => void;
}

const EligibilityChip: React.FC<{
  requirement: CourseRequirementDto;
  isChecking: boolean;
  onClick: () => void;
}> = ({ requirement, isChecking, onClick }) => {
  const summary = requirement.eligibilitySummary;

  if (isChecking) {
    return (
      <Tooltip title="Running eligibility check...">
        <Chip
          icon={<CircularProgress size={16} />}
          label="Checking..."
          size="small"
          variant="outlined"
        />
      </Tooltip>
    );
  }

  if (!summary) {
    return (
      <Tooltip title="Eligibility check pending or not run.">
        <Chip
          icon={<HelpOutlineIcon />}
          label="Unknown"
          size="small"
          variant="outlined"
        />
      </Tooltip>
    );
  }

  if (summary.issues === 0) {
    return (
      <Tooltip title="All students in the group are eligible for this requirement.">
        <Chip
          icon={<CheckCircleOutlineIcon />}
          label={`${summary.eligible}/${summary.total} Eligible`}
          size="small"
          color="success"
          variant="outlined"
        />
      </Tooltip>
    );
  }

  return (
    <Tooltip title="Click to view eligibility issues.">
      <Chip
        icon={<WarningAmberIcon />}
        label={`${summary.issues} Issue(s)`}
        size="small"
        color="warning"
        onClick={onClick}
        clickable
      />
    </Tooltip>
  );
};

export const CourseRequirementList: React.FC<Props> = ({
  requirements,
  onEdit,
  onDelete,
}) => {
  const [isIssuesModalOpen, setIsIssuesModalOpen] = useState(false);
  const [selectedRequirement, setSelectedRequirement] =
    useState<CourseRequirementDto | null>(null);

  const handleViewIssues = (req: CourseRequirementDto) => {
    setSelectedRequirement(req);
    setIsIssuesModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsIssuesModalOpen(false);
    setSelectedRequirement(null);
  };

  const checkingIds = useCourseRequirementStore((state) => state.checkingIds);

  if (requirements.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ p: 2, textAlign: "center" }}>
        No course requirements defined yet. Use the form to add one.
      </Typography>
    );
  }

  return (
    <>
      <Paper variant="outlined">
        <List dense>
          {requirements.map((req) => (
            <ListItem
              key={req.id}
              secondaryAction={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <EligibilityChip
                    requirement={req}
                    onClick={() => handleViewIssues(req)}
                    isChecking={checkingIds.has(req.id)}
                  />
                  <Tooltip title="Edit Requirement">
                    <IconButton edge="end" onClick={() => onEdit(req)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Requirement">
                    <IconButton edge="end" onClick={() => onDelete(req)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
              disablePadding
            >
              <ListItemText
                primary={`${req.courseName} (${req.classType})`}
                secondary={`For: ${req.studentGroupName}`}
                sx={{ mr: 4 }}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
      <RequirementIssuesModal
        open={isIssuesModalOpen}
        onClose={handleCloseModal}
        requirementId={selectedRequirement?.id || null}
        requirementName={selectedRequirement?.courseName}
      />
    </>
  );
};

export default CourseRequirementList;
