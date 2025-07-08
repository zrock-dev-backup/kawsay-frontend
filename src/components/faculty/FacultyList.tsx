import React from "react";
import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import type { TeacherDto } from "../../interfaces/teacherDtos";

interface FacultyListProps {
  teachers: TeacherDto[];
  onEdit: (teacher: TeacherDto) => void;
  onDeactivate: (id: number) => void;
}

export const FacultyList: React.FC<FacultyListProps> = ({
  teachers,
  onEdit,
  onDeactivate,
}) => {
  if (teachers.length === 0) {
    return (
      <Typography sx={{ p: 2, color: "text.secondary", textAlign: "center" }}>
        No teachers found. Add one to get started.
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Qualifications</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {teachers.map((teacher) => (
            <TableRow key={teacher.id}>
              <TableCell>{teacher.fullName}</TableCell>
              <TableCell>{teacher.email}</TableCell>
              <TableCell>{teacher.employmentType}</TableCell>
              <TableCell>{teacher.qualifications.length}</TableCell>
              <TableCell align="right">
                <Tooltip title="Edit">
                  <IconButton onClick={() => onEdit(teacher)} size="small">
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Deactivate">
                  <IconButton onClick={() => onDeactivate(teacher.id)} size="small" color="error">
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
