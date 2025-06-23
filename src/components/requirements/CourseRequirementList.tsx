// src/components/requirements/CourseRequirementList.tsx
import React from "react";
import {
  Box,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Tooltip,
  Typography,
  Chip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import type { CourseRequirementDto } from "../../interfaces/courseRequirementDtos";

interface Props {
  requirements: CourseRequirementDto[];
}

const CourseRequirementList: React.FC<Props> = ({ requirements }) => {
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
                <Tooltip title="Edit (Coming Soon)">
                  <span>
                    <IconButton edge="end" disabled>
                      <EditIcon />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Delete (Coming Soon)">
                  <span>
                    <IconButton edge="end" disabled>
                      <DeleteIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </>
            }
          >
            <ListItemText
              primary={`${req.courseName} (${req.classType})`}
              secondary={`For: ${req.studentGroupName} | Freq: ${req.frequency}x/week | Length: ${req.length}p`}
            />
            <Chip
              label={req.priority}
              color={req.priority === "High" ? "error" : "default"}
              size="small"
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default CourseRequirementList;
