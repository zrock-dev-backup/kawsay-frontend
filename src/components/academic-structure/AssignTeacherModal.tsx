import React, { useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
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
  Typography,
} from "@mui/material";
import { useFacultyStore } from "../../stores/useFacultyStore";
import type {
  TeacherDto,
  TimetableAssignmentDto,
} from "../../interfaces/teacherDtos";
import { FacultyForm } from "../faculty/FacultyForm";

interface AssignTeacherModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    data: Omit<
      TimetableAssignmentDto,
      "assignmentId" | "teacherFullName" | "timetableId"
    >,
  ) => Promise<boolean>;
  existingAssignments: TimetableAssignmentDto[];
  isSubmitting: boolean;
}

const defaultContract = {
  startWeek: 1,
  endWeek: 10,
  maximumWorkload: 2,
  workloadUnit: "Classes" as "Classes" | "Hours per Week",
};

export const AssignTeacherModal: React.FC<AssignTeacherModalProps> = ({
  open,
  onClose,
  onSubmit,
  existingAssignments,
  isSubmitting,
}) => {
  const {
    teachers,
    fetchTeachers,
    addTeacher,
    isLoading: isFacultyLoading,
  } = useFacultyStore();
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherDto | null>(
    null,
  );
  const [contract, setContract] = useState<{
    startWeek: number | string;
    endWeek: number | string;
    maximumWorkload: number | string;
    workloadUnit: "Classes" | "Hours per Week";
  }>(defaultContract);
  const [isNewTeacherFormOpen, setNewTeacherFormOpen] = useState(false);

  useEffect(() => {
    if (open) {
      fetchTeachers();
    }
  }, [open, fetchTeachers]);

  const handleContractChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    if (name === "workloadUnit") {
      setContract((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      const numValue = value === "" ? "" : Number(value);
      setContract((prev) => ({
        ...prev,
        [name]: numValue,
      }));
    }
  };

  const handleSubmit = async () => {
    if (!selectedTeacher) return;
    const success = await onSubmit({
      teacherId: selectedTeacher.id,
      startWeek: Number(contract.startWeek) || 1,
      endWeek: Number(contract.endWeek) || 10,
      maximumWorkload: Number(contract.maximumWorkload) || 2,
      workloadUnit: contract.workloadUnit,
    });
    if (success) {
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedTeacher(null);
    setContract(defaultContract);
    onClose();
  };

  const handleNewTeacherSubmit = async (
    data: Omit<TeacherDto, "id">,
  ): Promise<boolean> => {
    const success = await addTeacher(data);
    if (success) {
      setNewTeacherFormOpen(false);
    }
    return success;
  };

  const availableTeachers = useMemo(() => {
    const assignedIds = new Set(existingAssignments.map((a) => a.teacherId));
    return teachers.filter((t) => !assignedIds.has(t.id));
  }, [teachers, existingAssignments]);

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Assign Teacher from Directory</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Autocomplete
              options={availableTeachers}
              getOptionLabel={(option) =>
                `${option.fullName} (${option.email})`
              }
              value={selectedTeacher}
              onChange={(_, newValue) => setSelectedTeacher(newValue)}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              loading={isFacultyLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search for a teacher"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {isFacultyLoading ? (
                          <CircularProgress color="inherit" size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
            <Box sx={{ textAlign: "center", my: 1 }}>
              <Button onClick={() => setNewTeacherFormOpen(true)}>
                Can't find a teacher? Add New Teacher
              </Button>
            </Box>

            {selectedTeacher && (
              <Box>
                <Typography variant="overline" display="block" sx={{ mt: 2 }}>
                  Contract for this Timetable
                </Typography>
                <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                  <TextField
                    name="startWeek"
                    label="Start Week"
                    type="number"
                    value={contract.startWeek}
                    onChange={handleContractChange}
                  />
                  <TextField
                    name="endWeek"
                    label="End Week"
                    type="number"
                    value={contract.endWeek}
                    onChange={handleContractChange}
                  />
                  <TextField
                    name="maximumWorkload"
                    label="Max Workload"
                    type="number"
                    value={contract.maximumWorkload}
                    onChange={handleContractChange}
                  />
                  <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Unit</InputLabel>
                    <Select
                      name="workloadUnit"
                      value={contract.workloadUnit}
                      label="Unit"
                      onChange={handleContractChange as any}
                    >
                      <MenuItem value="Classes">Classes</MenuItem>
                      <MenuItem value="Hours per Week">Hours</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isSubmitting || !selectedTeacher}
          >
            {isSubmitting ? <CircularProgress size={24} /> : "Assign Teacher"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Nested modal for the "Escape Hatch" */}
      <FacultyForm
        open={isNewTeacherFormOpen}
        onClose={() => setNewTeacherFormOpen(false)}
        onSubmit={handleNewTeacherSubmit}
        isSubmitting={isFacultyLoading}
      />
    </>
  );
};
