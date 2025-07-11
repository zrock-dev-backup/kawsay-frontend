import React, { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { fetchTimetables } from "../services/timetableApi";
import type { TimetableStructure } from "../interfaces/timetableDtos";
import { TimetableList } from "../components/dashboard/TimetableList";

const TimetableDashboardPage: React.FC = () => {
  const [timetables, setTimetables] = useState<TimetableStructure[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  const draftTimetables = timetables.filter((tt) => tt.status === "Draft");
  const publishedTimetables = timetables.filter(
    (tt) => tt.status === "Published",
  );

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
    <Container maxWidth="lg">
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h4" component="h1">
          Timetable Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          component={RouterLink}
          to="/creation"
        >
          Create New Timetable
        </Button>
      </Stack>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TimetableList
            title="Draft Timetables"
            timetables={draftTimetables}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TimetableList
            title="Published Timetables"
            timetables={publishedTimetables}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default TimetableDashboardPage;
