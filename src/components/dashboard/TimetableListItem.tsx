import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Chip,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import type { TimetableStructure } from "../../interfaces/timetableDtos";

interface Props {
  timetable: TimetableStructure;
}

export const TimetableListItem: React.FC<Props> = ({ timetable }) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(`/table/${timetable.id}`);
  };

  const secondaryText = `
    ${dayjs(timetable.startDate).format("MMM D, YYYY")} - ${dayjs(timetable.endDate).format("MMM D, YYYY")} |
    ${timetable.days.length} Days, ${timetable.periods.length} Periods
  `;

  return (
    <ListItem disablePadding>
      <ListItemButton onClick={handleNavigate}>
        <ListItemText
          primary={
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body1" component="span">
                {timetable.name}
              </Typography>
              <Chip
                label={timetable.status}
                color={timetable.status === "Published" ? "success" : "default"}
                size="small"
              />
            </Stack>
          }
          secondary={secondaryText}
          primaryTypographyProps={{ fontWeight: "bold" }}
        />
      </ListItemButton>
    </ListItem>
  );
};
