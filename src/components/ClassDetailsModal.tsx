import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Modal,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { Class } from "../interfaces/classDtos";
import { fetchClassById } from "../services/apiClassService";

interface ClassDetailsModalProps {
  classId: number | null;
  open: boolean;
  onClose: () => void;
}

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "95%", sm: 500, md: 600 },
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  maxHeight: "90vh",
  overflowY: "auto",
};

const ClassDetailsModal: React.FC<ClassDetailsModalProps> = ({
  classId,
  open,
  onClose,
}) => {
  const [classData, setClassData] = useState<Class | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || classId === null) {
      setClassData(null);
      return;
    }

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
        setClassData(null);
      } finally {
        setLoading(false);
      }
    };

    loadClassData();
  }, [classId, open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="class-details-modal-title"
    >
      <Box sx={style}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography
            id="class-details-modal-title"
            variant="h6"
            component="h2"
          >
            Class Details
          </Typography>
          <IconButton onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 2 }} />
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading details...</Typography>
          </Box>
        )}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        {!loading && !error && classData && (
          <Grid container spacing={2}>
            <Grid size={{xs:12}}>
              <Typography variant="body1">
                <strong>Course:</strong> {classData.courseName} (
                {classData.courseCode})
              </Typography>
            </Grid>
            <Grid size={{xs:12}}>
              <Typography variant="body1">
                <strong>Teacher:</strong>{" "}
                {classData.teacherName || "Not Assigned"}
              </Typography>
            </Grid>
            <Grid size={{xs:6}}>
              <Typography variant="body1">
                <strong>Type:</strong> {classData.classType}
              </Typography>
            </Grid>
            <Grid size={{xs:6}}>
              <Typography variant="body1">
                <strong>Frequency:</strong> {classData.frequency} per week
              </Typography>
            </Grid>
            <Grid size={{xs:6}}>
              <Typography variant="body1">
                <strong>Length:</strong> {classData.length} period(s)
              </Typography>
            </Grid>
          </Grid>
        )}
        {!loading && !error && !classData && (
          <Typography variant="body1" color="text.secondary">
            No class data available.
          </Typography>
        )}
      </Box>
    </Modal>
  );
};

export default ClassDetailsModal;
