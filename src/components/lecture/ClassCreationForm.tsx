import React from 'react';
import {
    Container,
    Typography,
    Box,
    TextField,
    Button,
    Stack,
    CircularProgress,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
} from '@mui/material';
import { Controller, UseFormReturn, SubmitHandler } from 'react-hook-form';
import type { CreateClassRequest, TimetableStructure, Course, Teacher, TimetablePeriod } from '../../interfaces/apiDataTypes.ts';
import SlotPicker from './SlotPicker.tsx';

type CreateClassRequestInternal = Omit<CreateClassRequest, 'timetableId'>;

// Define the props the component will receive
interface ClassCreationFormProps {
    control: UseFormReturn<CreateClassRequestInternal>['control'];
    register: UseFormReturn<CreateClassRequestInternal>['register'];
    handleSubmit: UseFormReturn<CreateClassRequestInternal>['handleSubmit'];
    watch: UseFormReturn<CreateClassRequestInternal>['watch'];
    errors: UseFormReturn<CreateClassRequestInternal>['formState']['errors'];
    isSubmitting: boolean;
    submitStatus: { type: 'success' | 'error'; message: string } | null;
    fetchError: string | null;
    onSubmit: SubmitHandler<CreateClassRequestInternal>;
    timetableStructure: TimetableStructure | null;
    courses: Course[];
    teachers: Teacher[];
    sortedPeriods: TimetablePeriod[];
}

const ClassCreationForm: React.FC<ClassCreationFormProps> = ({
                                                                 control,
                                                                 register,
                                                                 handleSubmit,
                                                                 watch,
                                                                 errors,
                                                                 isSubmitting,
                                                                 submitStatus,
                                                                 fetchError,
                                                                 onSubmit,
                                                                 timetableStructure,
                                                                 courses,
                                                                 teachers,
                                                                 sortedPeriods
                                                             }) => {
    const classLength = watch('length');

    return (
        <Container maxWidth="md">
            <Typography variant="h4" gutterBottom>
                Create New Class for Timetable: {timetableStructure?.name}
            </Typography>

            {fetchError && (
                <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
                    Warning: Some data failed to load, functionality may be limited. Details: {fetchError}
                </Alert>
            )}
            {submitStatus && (
                <Alert severity={submitStatus.type} sx={{ mt: 2, mb: 2 }}>
                    {submitStatus.message}
                </Alert>
            )}

            <Box
                component="form"
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                sx={{ mt: 1 }}
            >
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <FormControl fullWidth required margin="normal" disabled={isSubmitting} error={!!errors.courseId}>
                        <InputLabel id="course-select-label">Course</InputLabel>
                        <Select
                            labelId="course-select-label"
                            id="course-select"
                            {...register("courseId")}
                            label="Course *"
                            defaultValue={-1}
                        >
                            <MenuItem value={-1} disabled><em>Select a Course</em></MenuItem>
                            {courses.map((course) => (
                                <MenuItem key={course.id} value={course.id}>
                                    {course.name} ({course.code})
                                </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>{errors.courseId?.message}</FormHelperText>
                    </FormControl>

                    <FormControl fullWidth required margin="normal" disabled={isSubmitting} error={!!errors.teacherId}>
                        <InputLabel id="teacher-select-label">Teacher</InputLabel>
                        <Select
                            labelId="teacher-select-label"
                            id="teacher-select"
                            {...register("teacherId")}
                            label="Teacher *"
                            defaultValue={-1}
                        >
                            <MenuItem value={-1} disabled><em>Select a Teacher</em></MenuItem>
                            {teachers.map((teacher) => (
                                <MenuItem key={teacher.id} value={teacher.id}>
                                    {teacher.name} ({teacher.type})
                                </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>{errors.teacherId?.message}</FormHelperText>
                    </FormControl>
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
                    <TextField
                        required
                        fullWidth
                        label="Periods length"
                        type="number"
                        {...register("length")}
                        InputProps={{ inputProps: { min: 1, step: 1 } }}
                        disabled={isSubmitting}
                        error={!!errors.length}
                        helperText={errors.length?.message}
                    />

                    <TextField
                        fullWidth
                        required
                        label="Frequency (per week)"
                        type="number"
                        {...register("frequency")}
                        InputProps={{ inputProps: { min: 1, step: 1 } }}
                        disabled={isSubmitting}
                        error={!!errors.frequency}
                        helperText={errors.frequency?.message}
                    />
                </Stack>

                <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 1 }}>
                    Period Preferences *
                </Typography>

                <FormControl fullWidth error={!!errors.periodPreferences}>
                    <Controller
                        name="periodPreferences"
                        control={control}
                        render={({ field }) => (
                            <SlotPicker
                                days={timetableStructure?.days || []}
                                periods={sortedPeriods}
                                length={Number(classLength) || 1}
                                value={field.value}
                                onChange={field.onChange}
                            />
                        )}
                    />
                    {errors.periodPreferences && (
                        <FormHelperText>{errors.periodPreferences.message}</FormHelperText>
                    )}
                </FormControl>

                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    disabled={isSubmitting}
                    aria-busy={isSubmitting}
                >
                    {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Create Class'}
                </Button>
            </Box>
        </Container>
    );
};

export default ClassCreationForm;
