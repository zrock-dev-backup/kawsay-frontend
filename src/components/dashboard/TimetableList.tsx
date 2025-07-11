import React from "react";
import { Box, Divider, List, Paper, Typography } from "@mui/material";
import type { TimetableStructure } from "../../interfaces/timetableDtos";
import { TimetableListItem } from "./TimetableListItem";

interface Props {
  title: string;
  timetables: TimetableStructure[];
}

export const TimetableList: React.FC<Props> = ({ title, timetables }) => {
  return (
    <Paper variant="outlined">
      <Box sx={{ p: 2 }}>
        <Typography variant="h6">{title}</Typography>
      </Box>
      <Divider />
      {timetables.length > 0 ? (
        <List dense>
          {timetables.map((tt) => (
            <TimetableListItem key={tt.id} timetable={tt} />
          ))}
        </List>
      ) : (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ p: 2, fontStyle: "italic" }}
        >
          No {title.toLowerCase()} found.
        </Typography>
      )}
    </Paper>
  );
};
