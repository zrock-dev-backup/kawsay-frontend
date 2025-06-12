import React from "react";
import { Autocomplete, Grid, TextField, Typography } from "@mui/material";
import { useClassCreationWizard } from "../../hooks/lecture/useClassCreationWizard.ts";

interface Props {
  wizard: ReturnType<typeof useClassCreationWizard>;
}

export const Step1_DefineClass: React.FC<Props> = ({ wizard }) => {
  const { state, handleCourseSelect, setFormValue } = wizard;
  const { form, allCourses, qualifiedTeachers, validationErrors } = state;

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12 }}>
        <Typography variant="body1" color="text.secondary">
          Class Type: <strong>{form.classType}</strong>
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Autocomplete
          options={allCourses}
          getOptionLabel={(option) => `${option.name} (${option.code})`}
          value={allCourses.find((c) => c.id === form.courseId) || null}
          onChange={(_, newValue) => handleCourseSelect(newValue?.id ?? null)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Course"
              required
              error={!!validationErrors.courseId}
              helperText={validationErrors.courseId}
            />
          )}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Autocomplete
          options={qualifiedTeachers}
          getOptionLabel={(option) => `${option.name} (${option.type})`}
          value={qualifiedTeachers.find((t) => t.id === form.teacherId) || null}
          onChange={(_, newValue) =>
            setFormValue("teacherId", newValue?.id ?? null)
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Qualified Teacher"
              required
              error={!!validationErrors.teacherId}
              helperText={validationErrors.teacherId}
            />
          )}
          disabled={!form.courseId}
          noOptionsText={
            !form.courseId
              ? "Select a course to see teachers"
              : "No qualified teachers found"
          }
        />
      </Grid>
    </Grid>
  );
};
