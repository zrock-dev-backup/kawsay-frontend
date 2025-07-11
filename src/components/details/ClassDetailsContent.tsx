import React, { useEffect, useState } from "react";
import { Alert, Box, CircularProgress, Grid, Typography } from "@mui/material";
import type { Class } from "../../interfaces/classDtos";
import { fetchClassById } from "../../services/apiClassService";

interface ClassDetailsContentProps {
  classId: number;
}

export const ClassDetailsContent: React.FC<ClassDetailsContentProps> = ({
  classId,
}) => {
  const [classData, setClassData] = useState<Class | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadClassData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchClassById(classId);
        setClassData(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load class details.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadClassData();
  }, [classId]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <CircularProgress size={24} />
        <Typography>Loading details...</Typography>
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!classData) {
    return <Typography>No class data available.</Typography>;
  }

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <Typography variant="body1">
          <strong>Course:</strong> {classData.courseName} (
          {classData.courseCode})
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Typography variant="body1">
          <strong>Teacher:</strong> {classData.teacherName || "Not Assigned"}
        </Typography>
      </Grid>
      <Grid size={{ xs: 6 }}>
        <Typography variant="body1">
          <strong>Type:</strong> {classData.classType}
        </Typography>
      </Grid>
      <Grid size={{ xs: 6 }}>
        <Typography variant="body1">
          <strong>Frequency:</strong> {classData.frequency} per week
        </Typography>
      </Grid>
      <Grid size={{ xs: 6 }}>
        <Typography variant="body1">
          <strong>Length:</strong> {classData.length} period(s)
        </Typography>
      </Grid>
    </Grid>
  );
};
