import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import type { TeacherDto } from "../../interfaces/teacherDtos";
import type { Course } from "../../interfaces/apiDataTypes";
import { CourseSelector } from "./CourseSelector";

interface FacultyFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<TeacherDto, "id">) => Promise<boolean>;
  initialData?: TeacherDto | null;
  isSubmitting: boolean;
}

const defaultValues: Omit<TeacherDto, "id"> = {
  fullName: "",
  email: "",
  employmentType: "Full-Time Professor",
  qualifications: [],
  isActive: true,
};

export const FacultyForm: React.FC<FacultyFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  isSubmitting,
}) => {
  const [values, setValues] = useState(defaultValues);

  useEffect(() => {
    if (initialData) {
      setValues(initialData);
    } else {
      setValues(defaultValues);
    }
  }, [initialData, open]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  const handleQualificationsChange = (courses: Course[]) => {
    setValues({ ...values, qualifications: courses });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const success = await onSubmit(values);
    if (success) {
      onClose();
    }
  };

  const isEditing = !!initialData;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>{isEditing ? "Edit Teacher" : "Add New Teacher"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              name="fullName"
              label="Full Name"
              value={values.fullName}
              onChange={handleChange}
              disabled={isSubmitting}
              required
              fullWidth
            />
            <TextField
              name="email"
              label="Email Address"
              type="email"
              value={values.email}
              onChange={handleChange}
              disabled={isSubmitting}
              required
              fullWidth
            />
            <FormControl fullWidth disabled={isSubmitting}>
              <InputLabel>Employment Type</InputLabel>
              <Select
                name="employmentType"
                value={values.employmentType}
                label="Employment Type"
                onChange={handleChange as any}
              >
                <MenuItem value="Full-Time Professor">Full-Time Professor</MenuItem>
                <MenuItem value="Adjunct Practitioner">Adjunct Practitioner</MenuItem>
                <MenuItem value="Lecturer">Lecturer</MenuItem>
              </Select>
            </FormControl>
            <CourseSelector
              selectedCourses={values.qualifications}
              onChange={handleQualificationsChange}
              disabled={isSubmitting}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} /> : "Save"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
