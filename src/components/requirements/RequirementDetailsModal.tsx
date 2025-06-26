import React from "react";
import {
  Box,
  Chip,
  Divider,
  Grid,
  IconButton,
  Modal,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { CourseRequirementDto } from "../../interfaces/courseRequirementDtos";
import dayjs from "dayjs";

interface Props {
  requirement: CourseRequirementDto | null;
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

const RequirementDetailsModal: React.FC<Props> = ({
  requirement,
  open,
  onClose,
}) => {
  if (!requirement) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="requirement-details-modal-title"
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
            id="requirement-details-modal-title"
            variant="h6"
            component="h2"
          >
            Requirement Details
          </Typography>
          <IconButton onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Typography variant="body1">
              <strong>Course:</strong> {requirement.courseName}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="body1">
              <strong>For Group:</strong> {requirement.studentGroupName}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="body1">
              <strong>Type:</strong> {requirement.classType}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="body1">
              <strong>Priority:</strong>{" "}
              <Chip label={requirement.priority} size="small" />
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="body1">
              <strong>Frequency:</strong> {requirement.frequency} per week
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="body1">
              <strong>Length:</strong> {requirement.length} period(s)
            </Typography>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="body1">
              <strong>Term:</strong>{" "}
              {dayjs(requirement.startDate).format("MMM D, YYYY")} to{" "}
              {dayjs(requirement.endDate).format("MMM D, YYYY")}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="body1" sx={{ mt: 1 }}>
              <strong>Ideal Preferences:</strong>
            </Typography>
            {requirement.schedulingPreferences.length > 0 ? (
              requirement.schedulingPreferences.map((p) => (
                <Chip
                  key={`${p.dayId}-${p.startPeriodId}`}
                  label={`Day ID: ${p.dayId}, Period ID: ${p.startPeriodId}`}
                  sx={{ mr: 1, mt: 0.5 }}
                />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                None specified.
              </Typography>
            )}
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default RequirementDetailsModal;
