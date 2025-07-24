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
  Tabs,
  Tab,
  Alert,
  Typography,
} from "@mui/material";
import type {
  TeacherDto,
  UpdateTeacherRequestDto,
} from "../../interfaces/teacherDtos";
import type { Course } from "../../interfaces/apiDataTypes";
import { CourseSelector } from "./CourseSelector";
import { AvailabilityGrid } from "./AvailabilityGrid";
import { useRosterState } from "../../hooks/faculty/useRosterState";
import { TimetableSelector } from "../common/TimetableSelector";

interface FacultyFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (id: number, data: UpdateTeacherRequestDto) => Promise<boolean>;
  initialData?: TeacherDto | null;
  isSubmitting: boolean;
}

const defaultValues: Omit<TeacherDto, "id"> = {
  fullName: "",
  email: "",
  employmentType: "Full-Time Professor",
  qualifications: [],
  isActive: true,
  defaultAvailabilityConstraints: [],
  timetableOverrides: [],
};

export const FacultyForm: React.FC<FacultyFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  isSubmitting,
}) => {
  const [values, setValues] = useState<
    Omit<TeacherDto, "id" | "isActive"> & { isActive?: boolean }
  >(defaultValues);
  const [tab, setTab] = useState(0);

  const {
    allTimetables,
    masterTimetable,
    activeTimetable,
    activeContextId,
    setActiveContextId,
  } = useRosterState();

  useEffect(() => {
    if (initialData) {
      setValues({
        ...initialData,
        defaultAvailabilityConstraints:
          initialData.defaultAvailabilityConstraints ?? [],
        timetableOverrides: initialData.timetableOverrides ?? [],
      });
    } else {
      setValues(defaultValues);
    }
    // Reset to the first tab and default context whenever the dialog opens/changes
    setTab(0);
    setActiveContextId("global");
  }, [initialData, open, setActiveContextId]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  const handleQualificationsChange = (courses: Course[]) => {
    setValues({ ...values, qualifications: courses });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!initialData) return;

    // pass the fields that can be edited.
    const { id, ...updateData } = { ...initialData, ...values };
    const success = await onSubmit(id, updateData);
    if (success) {
      onClose();
    }
  };

  const handleAvailabilitySave = async (
    //TODO: handle teacherID
    teacherId: number,
    updatedData: Partial<TeacherDto>,
  ) => {
    // Directly update the form's state when availability is saved from the grid.
    setValues((prev) => ({ ...prev, ...updatedData }));
  };

  const isEditing = !!initialData;
  const contextTimetable = activeTimetable || masterTimetable;
  const isOverrideContext = activeContextId !== "global";

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>
          {isEditing
            ? `Edit Faculty: ${initialData.fullName}`
            : "Add New Faculty"}
        </DialogTitle>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tab}
            onChange={(_, newValue) => setTab(newValue)}
            aria-label="teacher details tabs"
          >
            <Tab
              label="Profile"
              id="tab-details"
              aria-controls="tabpanel-details"
            />
            <Tab
              label="Availability"
              id="tab-availability"
              aria-controls="tabpanel-availability"
              disabled={!isEditing}
            />
          </Tabs>
        </Box>
        <DialogContent sx={{ minHeight: "60vh", p: { xs: 1, sm: 2, md: 3 } }}>
          {/* --- TAB 1: Profile Details ---
          TODO: split tabs into separate components
          */}
          <Box
            hidden={tab !== 0}
            role="tabpanel"
            id="tabpanel-details"
            aria-labelledby="tab-details"
            sx={{ pt: 2 }}
          >
            <Stack spacing={2}>
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
                  <MenuItem value="Full-Time Professor">
                    Full-Time Professor
                  </MenuItem>
                  <MenuItem value="Adjunct Practitioner">
                    Adjunct Practitioner
                  </MenuItem>
                  <MenuItem value="Lecturer">Lecturer</MenuItem>
                </Select>
              </FormControl>
              <CourseSelector
                selectedCourses={values.qualifications}
                onChange={handleQualificationsChange}
                disabled={isSubmitting}
              />
            </Stack>
          </Box>

          {/* --- TAB 2: Availability --- */}
          <Box
            hidden={tab !== 1}
            role="tabpanel"
            id="tabpanel-availability"
            aria-labelledby="tab-availability"
            sx={{ pt: 2 }}
          >
            {!contextTimetable || !masterTimetable || !initialData ? (
              <Alert severity="warning">
                Availability context cannot be loaded.
              </Alert>
            ) : (
              <>
                <Box
                  sx={{
                    mb: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="h6">Manage Availability</Typography>
                  <TimetableSelector
                    timetables={allTimetables}
                    activeId={activeContextId}
                    onChange={setActiveContextId}
                  />
                </Box>
                <AvailabilityGrid
                  key={activeContextId} // Force re-render when context changes
                  teacher={initialData}
                  contextTimetable={contextTimetable}
                  masterTimetable={masterTimetable}
                  isOverrideContext={isOverrideContext}
                  onSave={handleAvailabilitySave}
                />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: "16px 24px" }}>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} /> : "Save Changes"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
