import React from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { ICellRendererParams } from "ag-grid-community";
import { TeacherDto } from "../../../interfaces/teacherDtos";

interface FacultyActionsCellRendererParams
  extends ICellRendererParams<TeacherDto> {
  onEditProfile: (teacher: TeacherDto) => void;
}

export const FacultyActionsCellRenderer: React.FC<
  FacultyActionsCellRendererParams
> = ({ data: teacher, onEditProfile }) => {
  if (!teacher) return null;

  const handleEditClick = () => {
    onEditProfile(teacher);
  };

  return (
    <Box sx={{ display: "flex", height: "100%", alignItems: "center" }}>
      <Tooltip title="Edit Profile (Name, Email, etc.)">
        <IconButton onClick={handleEditClick} size="small">
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      {/* TODO: Future actions like "View Schedule" or "Deactivate" could go here */}
    </Box>
  );
};
