import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Button,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useFacultyStore } from "../stores/useFacultyStore";
import { LiveFacultyRoster } from "../components/faculty/LiveFacultyRoster";
import { FacultyForm } from "../components/faculty/FacultyForm";
import type {
  TeacherDto,
  UpdateTeacherRequestDto,
} from "../interfaces/teacherDtos";

export const FacultyRosterPage: React.FC = () => {
  const { teachers, isLoading, updateTeacher, fetchTeachers } =
    useFacultyStore();
  const [isFormOpen, setFormOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherDto | null>(null);

  React.useEffect(() => {
    fetchTeachers().catch((err) => {
      console.error(err);
    });
  }, [fetchTeachers]);

  const handleOpenForm = (teacher: TeacherDto | null = null) => {
    setEditingTeacher(teacher);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingTeacher(null);
    setFormOpen(false);
  };

  const handleSubmit = async (id: number, data: UpdateTeacherRequestDto) => {
    return updateTeacher(id, data);
  };

  if (isLoading && teachers.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 2, m: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5">Faculty Roster & Availability</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
        >
          Add New Teacher
        </Button>
      </Box>

      <LiveFacultyRoster
        teachers={teachers}
        isLoading={isLoading}
        onEditProfile={handleOpenForm}
      />

      <FacultyForm
        open={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        initialData={editingTeacher}
        isSubmitting={isLoading}
      />
    </Paper>
  );
};
