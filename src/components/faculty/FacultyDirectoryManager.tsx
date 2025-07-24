import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useFacultyStore } from "../../stores/useFacultyStore";
import { FacultyList } from "./FacultyList";
import { FacultyForm } from "./FacultyForm";
import type { TeacherDto } from "../../interfaces/teacherDtos";
import ConfirmationDialog from "../common/ConfirmationDialog.tsx";
import { useTimetableStore } from "../../stores/useTimetableStore.ts";

export const FacultyDirectoryManager: React.FC = () => {
  const {
    teachers,
    isLoading,
    error,
    fetchTeachers,
    addTeacher,
    editTeacher,
    removeTeacher,
  } = useFacultyStore();

  const { fetchTimetableData } = useTimetableStore();

  const [isFormOpen, setFormOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherDto | null>(null);
  const [deactivatingId, setDeactivatingId] = useState<number | null>(null);

  useEffect(() => {
    fetchTeachers();
    fetchTimetableData("1");
  }, [fetchTeachers, fetchTimetableData]);

  const handleOpenForm = (teacher: TeacherDto | null = null) => {
    setEditingTeacher(teacher);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingTeacher(null);
    setFormOpen(false);
  };

  const handleSubmit = async (data: Omit<TeacherDto, "id">) => {
    if (editingTeacher) {
      return editTeacher(editingTeacher.id, data);
    }
    return addTeacher(data);
  };

  const handleDeactivateConfirm = async () => {
    if (deactivatingId) {
      await removeTeacher(deactivatingId);
      setDeactivatingId(null);
    }
  };

  if (isLoading && teachers.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
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
        <Typography variant="h5">Faculty Directory</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
        >
          Add New Teacher
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <FacultyList
        teachers={teachers}
        onEdit={handleOpenForm}
        onDeactivate={(id) => setDeactivatingId(id)}
      />

      <FacultyForm
        open={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        initialData={editingTeacher}
        isSubmitting={isLoading}
      />

      <ConfirmationDialog
        open={!!deactivatingId}
        onClose={() => setDeactivatingId(null)}
        onConfirm={handleDeactivateConfirm}
        title="Deactivate Teacher?"
        description="This will remove the teacher from the active directory. They can be reactivated later. Are you sure?"
        confirmText="Deactivate"
        isLoading={isLoading}
      />
    </Paper>
  );
};
