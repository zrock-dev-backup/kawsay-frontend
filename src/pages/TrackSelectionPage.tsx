import React, { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  CircularProgress,
  Container,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import EventRepeatIcon from "@mui/icons-material/EventRepeat";
import type { TimetableStructure } from "../interfaces/apiDataTypes";
import { fetchTimetables } from "../services/apiService";

// --- FEATURE FLAG ---
const isEndOfModuleEnabled =
  import.meta.env.VITE_FEATURE_END_OF_MODULE_ENABLED === "true";

const TrackSelectionPage: React.FC = () => {
  const [timetables, setTimetables] = useState<TimetableStructure[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadTimetables = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchTimetables();
        setTimetables(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred.",
        );
      } finally {
        setLoading(false);
      }
    };
    loadTimetables();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Select a Timetable
      </Typography>
      {timetables.length === 0 ? (
        <Typography sx={{ mt: 2 }}>No timetables found.</Typography>
      ) : (
        <List sx={{ width: "100%", bgcolor: "background.paper", mt: 2 }}>
          {timetables.map((timetable) => (
            <ListItem
              key={timetable.id}
              disablePadding
              secondaryAction={
                <Stack direction="row" spacing={1}>
                  <Tooltip title="View Timetable Grid">
                    <IconButton
                      edge="end"
                      aria-label="view"
                      onClick={() => navigate(`/table/${timetable.id}`)}
                    >
                      <PlayArrowIcon />
                    </IconButton>
                  </Tooltip>
                  {isEndOfModuleEnabled && (
                    <Tooltip title="End-of-Module Processing">
                      <IconButton
                        edge="end"
                        aria-label="process"
                        component={RouterLink}
                        to={`/module-processing/${timetable.id}`}
                      >
                        <EventRepeatIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>
              }
            >
              <ListItemText
                primary={timetable.name}
                secondary={`${timetable.startDate} - ${timetable.endDate}`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Container>
  );
};

export default TrackSelectionPage;
