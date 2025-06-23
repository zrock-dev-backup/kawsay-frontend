import React, { useEffect } from "react";
import { Box, Grid, Paper, Typography } from "@mui/material";
import { useSchedulingStore } from "../stores/useSchedulingStore.ts";

const UnscheduledList = () => (
  <Paper
    sx={{
      p: 2,
      border: "1px dashed grey",
      textAlign: "center",
      height: "100%",
    }}
  >
    <Typography color="text.secondary">UnscheduledList Placeholder</Typography>
  </Paper>
);

const SchedulingGrid = () => (
  <Paper
    sx={{
      p: 2,
      border: "1px dashed grey",
      textAlign: "center",
      height: "100%",
    }}
  >
    <Typography color="text.secondary">SchedulingGrid Placeholder</Typography>
  </Paper>
);

const AssistedSchedulingTab: React.FC = () => {
  const resetSchedulingStore = useSchedulingStore((state) => state.reset);

  useEffect(() => {
    return () => {
      resetSchedulingStore(); // clean-up session state on component unmount
    };
  }, [resetSchedulingStore]);

  return (
    <Box>
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
