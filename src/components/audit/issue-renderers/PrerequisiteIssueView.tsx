import React from "react";
import {
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import type { PrerequisiteIssueContext } from "../../../interfaces/issueDtos";

interface Props {
  context: PrerequisiteIssueContext;
}

export const PrerequisiteIssueView: React.FC<Props> = ({ context }) => {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        The student has not completed the following prerequisites for the
        course:
        <Chip label={context.courseName} size="small" sx={{ ml: 1 }} />
      </Typography>
      <List dense disablePadding>
        {context.missingPrerequisites.map((prereq) => (
          <ListItem key={prereq.courseId}>
            <ListItemText
              primary={prereq.courseName}
              secondary={`Course ID: ${prereq.courseId}`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
