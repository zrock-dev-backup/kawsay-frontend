import React from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useTimetableStore } from "../../stores/useTimetableStore";

const Step5_Publish: React.FC = () => {
  const {
    structure,
    isPublishing,
    publishError,
    publishTimetable,
    clearPublishError,
  } = useTimetableStore();

  const handlePublish = async () => {
    if (structure) {
      await publishTimetable(structure.id.toString());
    }
  };

  return (
    <Box sx={{ p: 3, textAlign: "center" }}>
      <Typography variant="h5" gutterBottom>
        Final Step: Publish Timetable
      </Typography>

      {publishError && (
        <Alert
          severity="error"
          onClose={clearPublishError}
          sx={{ mb: 2, textAlign: "left" }}
        >
          {publishError}
        </Alert>
      )}

      <Alert severity="success" sx={{ mb: 3, textAlign: "left" }}>
        All previous steps are complete. The timetable is ready to be finalized
        and published.
      </Alert>

      <Typography variant="body1" sx={{ mb: 3, maxWidth: "600px", mx: "auto" }}>
        Publishing the timetable will lock it from the guided setup and make it
        available in the standard management view. This action completes the
        setup process.
      </Typography>
      <Button
        variant="contained"
        size="large"
        color="success"
        onClick={handlePublish}
        disabled={isPublishing || !structure}
        sx={{ minWidth: 200 }}
      >
        {isPublishing ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          "Publish Timetable"
        )}
      </Button>
    </Box>
  );
};

export default Step5_Publish;
