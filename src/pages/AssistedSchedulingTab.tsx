import React, { useEffect } from "react";
import { Alert, Box, Grid, Typography } from "@mui/material";
import { useSchedulingStore } from "../stores/useSchedulingStore.ts";
import UnscheduledList from "../components/scheduling/UnscheduledList.tsx";
import SchedulingGrid from "../components/scheduling/SchedulingGrid.tsx";

const AssistedSchedulingTab: React.FC = () => {
  const { reset, error } = useSchedulingStore((state) => ({
    reset: state.reset,
    error: state.error,
  }));

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Grid container spacing={2} sx={{ height: "75vh" }}>
        {/* Master Pane */}
        <Grid size={{ xs: 12, md: 4 }} sx={{ height: "100%" }}>
          <Typography variant="h6" gutterBottom>
            Unscheduled Requirements
          </Typography>
          <UnscheduledList />
        </Grid>
        {/* Detail Pane */}
        <Grid size={{ xs: 12, md: 8 }} sx={{ height: "100%" }}>
          <Typography variant="h6" gutterBottom>
            Scheduling Grid
          </Typography>
          <SchedulingGrid />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AssistedSchedulingTab;
