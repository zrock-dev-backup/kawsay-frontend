import React from 'react';
import {Autocomplete, Grid, TextField, Typography} from '@mui/material';
import {useClassCreationWizard} from '../../hooks/lecture/useClassCreationWizard.ts';

interface Props {
    wizard: ReturnType<typeof useClassCreationWizard>;
}

export const Step1_DefineClass: React.FC<Props> = ({wizard}) => {
    const {state, handleCourseSelect, setFormValue} = wizard;

    return (
        <Grid container spacing={2}>
            <Grid size={{xs: 12}}>
                <Typography variant="h6" gutterBottom>
                    Selected Type: {state.form.classType}
                </Typography>
            </Grid>
            <Grid size={{xs: 12, sm: 6}}>
                <Autocomplete
                    options={state.allCourses}
                    getOptionLabel={(option) => `${option.name} (${option.code})`}
                    value={state.allCourses.find(c => c.id === state.form.courseId) || null}
                    onChange={(_, newValue) => handleCourseSelect(newValue?.id ?? null)}
                    renderInput={(params) => <TextField {...params} label="Course" required/>}
                />
            </Grid>
            <Grid size={{xs: 12, sm: 6}}>
                <Autocomplete
                    options={state.qualifiedTeachers}
                    getOptionLabel={(option) => `${option.name} (${option.type})`}
                    value={state.qualifiedTeachers.find(t => t.id === state.form.teacherId) || null}
                    onChange={(_, newValue) => setFormValue('teacherId', newValue?.id ?? 0)}
                    renderInput={(params) => <TextField {...params} label="Qualified Teacher" required/>}
                    disabled={!state.form.courseId}
                    noOptionsText="Select a course to see qualified teachers"
                />
            </Grid>
        </Grid>
    );
};
