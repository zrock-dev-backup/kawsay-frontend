import React from "react";
import {
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import { useCourseRequirementStore } from "../../stores/useCourseRequirementStore.ts";
import { useSchedulingStore } from "../../stores/useSchedulingStore.ts";

const UnscheduledList: React.FC = () => {
  const { requirements } = useCourseRequirementStore();
  const {
    stagedPlacements,
    selectRequirement,
    selectedRequirementId,
    isLoading,
  } = useSchedulingStore();

  const stagedRequirementIds = new Set(
    stagedPlacements.map((p) => p.courseRequirementId),
  );

  const unscheduledRequirements = requirements.filter(
    (r) => !stagedRequirementIds.has(r.id),
  );

  if (unscheduledRequirements.length === 0 && requirements.length > 0) {
    return (
      <Paper
        sx={{ p: 3, textAlign: "center", backgroundColor: "success.light" }}
      >
        <Typography variant="h6" color="success.dark">
          All requirements have been staged!
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper variant="outlined" sx={{ height: "100%", overflowY: "auto" }}>
      <List dense disablePadding>
        {unscheduledRequirements.map((req) => (
          <ListItemButton
            key={req.id}
            selected={selectedRequirementId === req.id}
            onClick={() => selectRequirement(req.id)}
            disabled={isLoading}
          >
            <ListItemText
              primary={req.courseName}
              secondary={`${req.classType} | For: ${req.studentGroupName}`}
            />
            {isLoading && selectedRequirementId === req.id && (
              <CircularProgress size={20} />
            )}
          </ListItemButton>
        ))}
      </List>
      {unscheduledRequirements.length === 0 && (
        <Box sx={{ p: 2, textAlign: "center" }}>
          <Typography color="text.secondary">
            No requirements to schedule.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default UnscheduledList;
