import React from "react";
import {
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Tooltip,
  Typography,
  Chip,
  ListItemButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import type { CourseRequirementDto } from "../../interfaces/courseRequirementDtos";

interface Props {
  requirements: CourseRequirementDto[];
  onEdit: (requirement: CourseRequirementDto) => void;
  onDelete: (requirement: CourseRequirementDto) => void;
  onViewDetails: (requirement: CourseRequirementDto) => void;
}

const CourseRequirementList: React.FC<Props> = ({
  requirements,
  onEdit,
  onDelete,
  onViewDetails,
}) => {
  if (requirements.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ p: 2, textAlign: "center" }}>
        No course requirements defined yet. Use the form to add one.
      </Typography>
    );
  }

  return (
    <Paper variant="outlined">
      <List dense>
        {requirements.map((req) => (
          <ListItem
            key={req.id}
            secondaryAction={
              <>
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
              </>
            }
            disablePadding
          >
            <ListItemButton onClick={() => onViewDetails(req)}>
              <ListItemText
                primary={`${req.courseName} (${req.classType})`}
                secondary={`For: ${req.studentGroupName} | Freq: ${req.frequency}x/week`}
                sx={{ mr: 4 }}
              />
              <Chip
                label={req.priority}
                size="small"
                sx={{ mr: 8 }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default CourseRequirementList;
