import React from "react";
import {
  Alert,
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
import dayjs from "dayjs";
import type { CourseRequirementDto } from "../../interfaces/courseRequirementDtos";
import type { ClassType } from "../../interfaces/classDtos";
import SlotPicker from "../lecture/SlotPicker";
import { EligibilityConfirmationDialog } from "./EligibilityConfirmationDialog";
import { useCourseRequirementForm } from "../../hooks/requirements/useCourseRequirementForm";

interface Props {
  timetableId: number;
  requirementToEdit: CourseRequirementDto | null;
  onCancelEdit: () => void;
}

const CourseRequirementForm: React.FC<Props> = ({
  timetableId,
  requirementToEdit,
  onCancelEdit,
}) => {
  const {
    formState,
    uiState,
    confirmationState,
    dataError,
    isEditMode,
    isBusy,
    isChecking,
    isSubmitDisabled,
    courses,
    cohorts,
    groups,
    sections,
    qualifiedTeachers,
    timetableStructure,
    sortedPeriods,
    actions,
  } = useCourseRequirementForm({
    timetableId,
    requirementToEdit,
    onFormSuccess: onCancelEdit,
  });

  if (dataError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {dataError}
        <Button onClick={() => window.location.reload()} sx={{ ml: 2 }}>
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Typography variant="h6" gutterBottom>
        {isEditMode && requirementToEdit
          ? `Editing: ${requirementToEdit.courseName}`
          : "Add New Requirement"}
      </Typography>
      <Box component="form" onSubmit={actions.handleSubmit}>
        <Grid container spacing={2}>
          <Grid size={{xs:12}}>
            <Autocomplete
              options={courses}
              getOptionLabel={(option) => `${option.name} (${option.code})`}
              value={courses.find((c) => c.id === formState.courseId) || null}
              onChange={(_, newValue) =>
                actions.handleModelChange("courseId", newValue?.id ?? null)
              }
              renderInput={(params) => (
                <TextField {...params} label="Course" required />
              )}
              disabled={isBusy}
            />
          </Grid>

          <Grid size={{xs:12, sm:6}}>
            <FormControl fullWidth>
              <InputLabel>Class Type</InputLabel>
              <Select
                value={formState.classType}
                label="Class Type"
                onChange={(e) =>
                  actions.handleClassTypeChange(e.target.value as ClassType)
                }
                disabled={isBusy}
              >
                <MenuItem value="Masterclass">Masterclass</MenuItem>
                <MenuItem value="Lab">Lab</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {formState.classType === 'Masterclass' ? (
            <Grid size={{xs:12, sm:6}}>
              <Autocomplete
                options={groups}
                getOptionLabel={(option) => option.name}
                value={groups.find((g) => g.id === formState.studentGroupId) || null}
                onChange={(_, newValue) =>
                  actions.handleModelChange("studentGroupId", newValue?.id ?? null)
                }
                renderInput={(params) => (
                  <TextField {...params} label="Student Group" required />
                )}
                disabled={isBusy}
              />
            </Grid>
          ) : (
            <>
              <Grid size={{xs:12, sm:4}}>
                <Autocomplete
                  options={cohorts}
                  getOptionLabel={(option) => option.name}
                  value={cohorts.find((c) => c.id === uiState.cohortId) || null}
                  onChange={(_, newValue) => {
                    actions.handleUiChange("cohortId", newValue?.id ?? null);
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Cohort" required />
                  )}
                  disabled={isBusy}
                />
              </Grid>
              <Grid size={{xs:12, sm:4}}>
                <Autocomplete
                  options={groups}
                  getOptionLabel={(option) => option.name}
                  value={groups.find((g) => g.id === uiState.groupId) || null}
                  onChange={(_, newValue) => {
                    actions.handleUiChange("groupId", newValue?.id ?? null);
                    // Also update the model's studentGroupId for validation purposes
                    actions.handleModelChange("studentGroupId", newValue?.id ?? null);
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Group" required />
                  )}
                  disabled={isBusy || !uiState.cohortId}
                />
              </Grid>
              <Grid size={{xs:12, sm:4}}>
                <Autocomplete
                  options={sections}
                  getOptionLabel={(option) => option.name}
                  value={sections.find((s) => s.id === formState.studentSectionId) || null}
                  onChange={(_, newValue) =>
                    actions.handleModelChange("studentSectionId", newValue?.id ?? null)
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Section" required />
                  )}
                  disabled={isBusy || !uiState.groupId}
                />
              </Grid>
            </>
          )}

          <Grid size={{xs:12, sm:6}}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={formState.priority}
                label="Priority"
                onChange={(e) => actions.handleModelChange("priority", e.target.value)}
                disabled={isBusy}
              >
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{xs:12, sm:6}}>
            <Autocomplete
              options={qualifiedTeachers}
              getOptionLabel={(teacher) => teacher.name}
              value={qualifiedTeachers.find((t) => t.id === formState.requiredTeacherId) || null}
              onChange={(_, newValue) =>
                actions.handleModelChange("requiredTeacherId", newValue?.id ?? null)
              }
              renderInput={(params) => (
                <TextField {...params} label="Required Teacher (Optional)" />
              )}
              disabled={isBusy || !formState.courseId}
            />
          </Grid>

          <Grid size={{xs:12, sm:6}}>
            <TextField
              label="Periods Length"
              type="number"
              fullWidth
              value={formState.length || ""}
              onChange={(e) =>
                actions.handleModelChange("length", Number(e.target.value))
              }
              InputProps={{ inputProps: { min: 1, max: 8 } }}
              disabled={isBusy}
              required
            />
          </Grid>

          <Grid size={{xs:12, sm:6}}>
            <TextField
              label="Frequency (per week)"
              type="number"
              fullWidth
              value={formState.frequency || ""}
              onChange={(e) =>
                actions.handleModelChange("frequency", Number(e.target.value))
              }
              InputProps={{ inputProps: { min: 1, max: 7 } }}
              disabled={isBusy}
              required
            />
          </Grid>

          <Grid size={{xs:12, sm:6}}>
            <DatePicker
              label="Start Date"
              value={formState.startDate}
              onChange={(newValue) => actions.handleModelChange("startDate", newValue)}
              minDate={dayjs(timetableStructure?.startDate)}
              maxDate={dayjs(timetableStructure?.endDate)}
              disabled={isBusy}
              slotProps={{
                textField: { fullWidth: true, required: true },
              }}
            />
          </Grid>

          <Grid size={{xs:12, sm:6}}>
            <DatePicker
              label="End Date"
              value={formState.endDate}
              onChange={(newValue) => actions.handleModelChange("endDate", newValue)}
              minDate={formState.startDate ?? dayjs(timetableStructure?.startDate)}
              maxDate={dayjs(timetableStructure?.endDate)}
              disabled={isBusy}
              slotProps={{
                textField: { fullWidth: true, required: true },
              }}
            />
          </Grid>

          <Grid size={{xs:12}}>
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
                actions.handleModelChange("schedulingPreferences", newValue)
              }
            />
          </Grid>

          <Grid size={{xs:12}}>
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isSubmitDisabled}
              >
                {isChecking ? (
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

      <EligibilityConfirmationDialog
        open={!!confirmationState}
        onClose={actions.handleCancelConfirmation}
        onConfirm={actions.handleConfirmCreate}
        summary={confirmationState?.checkResult.summary ?? null}
      />
    </LocalizationProvider>
  );
};

export default CourseRequirementForm;
