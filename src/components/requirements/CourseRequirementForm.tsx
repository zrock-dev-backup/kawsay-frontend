import React, { useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { useCourseRequirementStore } from "../../stores/useCourseRequirementStore";
import type {
  CourseRequirementDto,
  CreateCourseRequirementRequest,
} from "../../interfaces/courseRequirementDtos";
import type { ClassType } from "../../interfaces/classDtos";
import SlotPicker from "../lecture/SlotPicker";
import { useTimetableStore } from "../../stores/useTimetableStore";

// --- MOCKED DATA FOR FORM ---
const MOCK_COURSES = [
  { id: 1, name: "Advanced Software Engineering", code: "CSE401" },
  { id: 2, name: "Machine Learning Fundamentals", code: "AI201" },
  { id: 3, name: "Database Systems", code: "DB303" },
];
const MOCK_STUDENT_GROUPS = [
  { id: 101, name: "Fall 2025 - Group A" },
  { id: 102, name: "Fall 2025 - Group B" },
];

// --- END MOCKED DATA ---

interface Props {
  timetableId: number;
  requirementToEdit: CourseRequirementDto | null;
  onCancelEdit: () => void;
}

const getInitialState = (
  timetableId: number,
): CreateCourseRequirementRequest => ({
  timetableId,
  courseId: null,
  studentGroupId: null,
  classType: "Masterclass",
  length: 1,
  frequency: 1,
  priority: "Medium",
  requiredTeacherId: null,
  startDate: dayjs().add(1, "day"),
  endDate: dayjs().add(8, "week"),
  schedulingPreferences: [],
});

const CourseRequirementForm: React.FC<Props> = ({
  timetableId,
  requirementToEdit,
  onCancelEdit,
}) => {
  const { addRequirement, updateRequirement, isLoading } =
    useCourseRequirementStore();
  const { structure: timetableStructure } = useTimetableStore();

  const [formState, setFormState] = useState<CreateCourseRequirementRequest>(
    getInitialState(timetableId),
  );

  const isEditMode = requirementToEdit !== null;

  useEffect(() => {
    if (isEditMode) {
      setFormState({
        ...requirementToEdit,
        startDate: dayjs(requirementToEdit.startDate),
        endDate: dayjs(requirementToEdit.endDate),
      });
    } else {
      setFormState(getInitialState(timetableId));
    }
  }, [requirementToEdit, isEditMode, timetableId]);

  const handleInputChange = (
    field: keyof CreateCourseRequirementRequest,
    value: any,
  ) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const sortedPeriods = useMemo(() => {
    if (!timetableStructure?.periods) return [];
    return [...timetableStructure.periods].sort((a, b) =>
      a.start.localeCompare(b.start),
    );
  }, [timetableStructure?.periods]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formState.courseId || !formState.studentGroupId) {
      // Basic validation
      alert("Please select a Course and a Student Group.");
      return;
    }

    const payload = {
      ...formState,
      // date formatting
      startDate: (formState.startDate as Dayjs).format("YYYY-MM-DD"),
      endDate: (formState.endDate as Dayjs).format("YYYY-MM-DD"),
    };

    let success = false;
    if (isEditMode) {
      success = await updateRequirement(requirementToEdit.id, payload as any);
    } else {
      success = await addRequirement(payload as any);
    }

    if (success) {
      onCancelEdit();
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Typography variant="h6" gutterBottom>
        {isEditMode
          ? `Editing: ${requirementToEdit.courseName}`
          : "Add New Requirement"}
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Autocomplete
              options={MOCK_COURSES}
              getOptionLabel={(option) => `${option.name} (${option.code})`}
              value={
                MOCK_COURSES.find((c) => c.id === formState.courseId) || null
              }
              onChange={(_, newValue) =>
                handleInputChange("courseId", newValue?.id ?? null)
              }
              renderInput={(params) => (
                <TextField {...params} label="Course" required />
              )}
              disabled={isLoading}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Autocomplete
              options={MOCK_STUDENT_GROUPS}
              getOptionLabel={(option) => option.name}
              value={
                MOCK_STUDENT_GROUPS.find(
                  (g) => g.id === formState.studentGroupId,
                ) || null
              }
              onChange={(_, newValue) =>
                handleInputChange("studentGroupId", newValue?.id ?? null)
              }
              renderInput={(params) => (
                <TextField {...params} label="Student Group" required />
              )}
              disabled={isLoading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Class Type</InputLabel>
              <Select
                value={formState.classType}
                label="Class Type"
                onChange={(e) =>
                  handleInputChange("classType", e.target.value as ClassType)
                }
                disabled={isLoading}
              >
                <MenuItem value="Masterclass">Masterclass</MenuItem>
                <MenuItem value="Lab">Lab</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={formState.priority}
                label="Priority"
                onChange={(e) => handleInputChange("priority", e.target.value)}
                disabled={isLoading}
              >
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Periods Length"
              type="number"
              fullWidth
              value={formState.length || ""}
              onChange={(e) =>
                handleInputChange("length", Number(e.target.value))
              }
              InputProps={{ inputProps: { min: 1 } }}
              disabled={isLoading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Frequency (per week)"
              type="number"
              fullWidth
              value={formState.frequency || ""}
              onChange={(e) =>
                handleInputChange("frequency", Number(e.target.value))
              }
              InputProps={{ inputProps: { min: 1 } }}
              disabled={isLoading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <DatePicker
              label="Start Date"
              value={formState.startDate}
              onChange={(newValue) => handleInputChange("startDate", newValue)}
              minDate={dayjs(timetableStructure?.startDate)}
              maxDate={dayjs(timetableStructure?.endDate)}
              disabled={isLoading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <DatePicker
              label="End Date"
              value={formState.endDate}
              onChange={(newValue) => handleInputChange("endDate", newValue)}
              minDate={
                formState.startDate ?? dayjs(timetableStructure?.startDate)
              }
              maxDate={dayjs(timetableStructure?.endDate)}
              disabled={isLoading}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Box sx={{ mt: 1, mb: 1 }}>
              <Typography variant="subtitle2">
                Ideal Time Slot Preferences (Optional)
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                Select one or more ideal start times. The scheduling engine will
                prioritize these slots but may place the class elsewhere if
                necessary.
              </Typography>
            </Box>
            <SlotPicker
              days={timetableStructure?.days ?? []}
              periods={sortedPeriods}
              length={formState.length}
              value={formState.schedulingPreferences}
              onChange={(newValue) =>
                handleInputChange("schedulingPreferences", newValue)
              }
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={
                  isLoading || !formState.courseId || !formState.studentGroupId
                }
              >
                {isLoading ? (
                  <CircularProgress size={24} />
                ) : isEditMode ? (
                  "Save Changes"
                ) : (
                  "Add Requirement"
                )}
              </Button>
              {isEditMode && (
                <Button variant="outlined" onClick={onCancelEdit} fullWidth>
                  Cancel
                </Button>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default CourseRequirementForm;
