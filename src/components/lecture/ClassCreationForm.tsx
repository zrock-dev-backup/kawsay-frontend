import React from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    FormControl,
    FormControlLabel,
    FormHelperText,
    FormLabel,
    InputLabel,
    MenuItem,
    Radio,
    RadioGroup,
    Select,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import {Controller, SubmitHandler, UseFormReturn} from 'react-hook-form';
import type {CreateClassRequest} from '../../interfaces/classDtos';
import type {Course, Teacher, TimetablePeriod, TimetableStructure} from '../../interfaces/apiDataTypes';
import SlotPicker from './SlotPicker';
import {Link as RouterLink} from 'react-router-dom';
import {CohortDetailDto} from '../../interfaces/academicStructureDtos';

interface ClassCreationFormProps {
    control: UseFormReturn<CreateClassRequest>['control'];
    register: UseFormReturn<CreateClassRequest>['register'];
    handleSubmit: UseFormReturn<CreateClassRequest>['handleSubmit'];
    watch: UseFormReturn<CreateClassRequest>['watch'];
    errors: UseFormReturn<CreateClassRequest>['formState']['errors'];
    isSubmitting: boolean;
    submitStatus: { type: 'success' | 'error'; message: string } | null;
    fetchError: string | null;
    onSubmit: SubmitHandler<CreateClassRequest>;
    timetableStructure: TimetableStructure | null;
    courses: Course[];
    teachers: Teacher[];
    cohorts: CohortDetailDto[];
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
                                                                 cohorts,
                                                                 sortedPeriods
                                                             }) => {
    const classLength = watch('length');
    const classType = watch('classType');


    const allGroups = cohorts.flatMap(c => c.studentGroups);
    const allSections = allGroups.flatMap(g => g.sections);
    const hasStructure = cohorts.length > 0 && allGroups.length > 0;

    if (!hasStructure && !fetchError) {
        return (
            <Container maxWidth="md">
                <Alert severity="warning" sx={{mt: 2, mb: 2}}>
                    No academic structure (cohorts, groups, sections) has been defined for this timetable yet.
                    Please <Button component={RouterLink} to={`/table/${timetableStructure?.id}`}>go to the Academic
                    Structure tab</Button> to create one before adding classes.
                </Alert>
            </Container>
        )
    }

    return (
        <Container maxWidth="md">
            <Typography variant="h4" gutterBottom>
                Create New Class for Timetable: {timetableStructure?.name}
            </Typography>

            {fetchError && (
                <Alert severity="warning" sx={{mt: 2, mb: 2}}>
                    Warning: Some data failed to load. Details: {fetchError}
                </Alert>
            )}
            {submitStatus && (
                <Alert severity={submitStatus.type} sx={{mt: 2, mb: 2}}>
                    {submitStatus.message}
                </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{mt: 1}}>
                <Stack direction={{xs: 'column', sm: 'row'}} spacing={2}>
                    <FormControl fullWidth required margin="normal" disabled={isSubmitting} error={!!errors.courseId}>
                        <InputLabel id="course-select-label">Course</InputLabel>
                        <Controller name="courseId" control={control} render={({field}) => (
                            <Select {...field} labelId="course-select-label" label="Course *">
                                <MenuItem value={-1} disabled><em>Select a Course</em></MenuItem>
                                {courses.map((course) => (<MenuItem key={course.id}
                                                                    value={course.id}>{course.name} ({course.code})</MenuItem>))}
                            </Select>
                        )}/>
                        <FormHelperText>{errors.courseId?.message}</FormHelperText>
                    </FormControl>
                    <FormControl fullWidth required margin="normal" disabled={isSubmitting} error={!!errors.teacherId}>
                        <InputLabel id="teacher-select-label">Teacher</InputLabel>
                        <Controller name="teacherId" control={control} render={({field}) => (
                            <Select {...field} labelId="teacher-select-label" label="Teacher *">
                                <MenuItem value={-1} disabled><em>Select a Teacher</em></MenuItem>
                                {teachers.map((teacher) => (<MenuItem key={teacher.id}
                                                                      value={teacher.id}>{teacher.name} ({teacher.type})</MenuItem>))}
                            </Select>
                        )}/>
                        <FormHelperText>{errors.teacherId?.message}</FormHelperText>
                    </FormControl>
                </Stack>
                <Stack direction={{xs: 'column', sm: 'row'}} spacing={2} sx={{mt: 2}}>
                    <TextField required fullWidth label="Periods length" type="number" {...register("length")}
                               InputProps={{inputProps: {min: 1, step: 1}}} disabled={isSubmitting}
                               error={!!errors.length} helperText={errors.length?.message}/>
                    <TextField fullWidth required label="Frequency (per week)" type="number" {...register("frequency")}
                               InputProps={{inputProps: {min: 1, step: 1}}} disabled={isSubmitting}
                               error={!!errors.frequency} helperText={errors.frequency?.message}/>
                </Stack>

                <FormControl component="fieldset" margin="normal" required error={!!errors.classType}>
                    <FormLabel component="legend">Class Type</FormLabel>
                    <Controller name="classType" control={control} render={({field}) => (
                        <RadioGroup {...field} row>
                            <FormControlLabel value="Masterclass" control={<Radio/>} label="Masterclass"/>
                            <FormControlLabel value="Lab" control={<Radio/>} label="Lab"/>
                        </RadioGroup>
                    )}/>
                    <FormHelperText>{errors.classType?.message}</FormHelperText>
                </FormControl>

                {classType === 'Masterclass' && (
                    <FormControl fullWidth required margin="normal" disabled={isSubmitting}
                                 error={!!errors.studentGroupId}>
                        <InputLabel id="group-select-label">Student Group</InputLabel>
                        <Controller name="studentGroupId" control={control} render={({field}) => (
                            <Select {...field} labelId="group-select-label" label="Student Group *">
                                <MenuItem value={-1} disabled><em>Select a Student Group</em></MenuItem>
                                {allGroups.map((group) => (
                                    <MenuItem key={group.id} value={group.id}>{group.name}</MenuItem>))}
                            </Select>
                        )}/>
                        <FormHelperText>{errors.studentGroupId?.message}</FormHelperText>
                    </FormControl>
                )}

                {classType === 'Lab' && (
                    <FormControl fullWidth required margin="normal" disabled={isSubmitting} error={!!errors.sectionId}>
                        <InputLabel id="section-select-label">Section</InputLabel>
                        <Controller name="sectionId" control={control} render={({field}) => (
                            <Select {...field} labelId="section-select-label" label="Section *">
                                <MenuItem value={-1} disabled><em>Select a Section</em></MenuItem>
                                {allSections.map((section) => (
                                    <MenuItem key={section.id} value={section.id}>{section.name}</MenuItem>))}
                            </Select>
                        )}/>
                        <FormHelperText>{errors.sectionId?.message}</FormHelperText>
                    </FormControl>
                )}

                <Typography variant="h6" gutterBottom sx={{mt: 3, mb: 1}}>Period Preferences *</Typography>
                <FormControl fullWidth error={!!errors.periodPreferences}>
                    <Controller name="periodPreferences" control={control} render={({field}) => (
                        <SlotPicker days={timetableStructure?.days || []} periods={sortedPeriods}
                                    length={Number(classLength) || 1} value={field.value}
                                    onChange={field.onChange}/>)}/>
                    {errors.periodPreferences && (<FormHelperText>{errors.periodPreferences.message}</FormHelperText>)}
                </FormControl>

                <Button type="submit" fullWidth variant="contained" sx={{mt: 3, mb: 2}} disabled={isSubmitting}
                        aria-busy={isSubmitting}>
                    {isSubmitting ? <CircularProgress size={24} color="inherit"/> : 'Create Class'}
                </Button>
            </Box>
        </Container>
    );
};

export default ClassCreationForm;
