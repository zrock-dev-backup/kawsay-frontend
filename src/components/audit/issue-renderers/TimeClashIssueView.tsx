import React from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Radio,
  Typography,
} from "@mui/material";
import type { TimeClashIssueContext } from "../../../interfaces/issueDtos";

interface Props {
  context: TimeClashIssueContext;
  selectedValue: number | null;
  onSelectionChange: (classId: number) => void;
}

export const TimeClashIssueView: React.FC<Props> = ({
  context,
  selectedValue,
  onSelectionChange,
}) => {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        The following classes have a time conflict:
      </Typography>
      <List dense disablePadding>
        {context.conflictingClasses.map((cls) => (
          <ListItem key={cls.classId}>
            <ListItemText
              primary={cls.courseName}
              secondary={cls.scheduleSummary}
            />
          </ListItem>
        ))}
      </List>
      <Typography variant="subtitle2" sx={{ mt: 2, fontWeight: "bold" }}>
        Suggested Alternative Timeslots:
      </Typography>
      <List dense>
        {context.suggestedAlternatives.map((alt) => (
          <ListItemButton
            key={alt.classId}
            onClick={() => onSelectionChange(alt.classId)}
            selected={selectedValue === alt.classId}
          >
            <Radio
              checked={selectedValue === alt.classId}
              edge="start"
              tabIndex={-1}
            />
            <ListItemText
              primary={`${alt.courseName} with ${alt.teacherName}`}
              secondary={`${alt.scheduleSummary} | Capacity: ${alt.currentEnrollment}/${alt.capacity}`}
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
};
