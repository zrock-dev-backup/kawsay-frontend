import React, {useState, useEffect, useCallback, useMemo} from 'react';
import {useParams} from 'react-router-dom';
import {useForm, SubmitHandler, useFieldArray} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import * as yup from 'yup';
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
    Skeleton,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import type {
    Course,
    Teacher,
    TimetableStructure,
    CreateClassRequest,
} from '../interfaces/apiDataTypes';
import {
    fetchCourses,
    fetchTeachers,
    fetchTimetableStructureById,
    createClass,
} from '../services/apiService';
import dayjs from "dayjs";
import OccurrenceFormList from "../components/OcurrenceFormList.tsx";

const periodPreferenceSchema = yup.object().shape({
    startPeriodId: yup.number().required('Start Time is required').typeError('Start Time is required'),
});

type CreateClassRequestInternal = Omit<CreateClassRequest, 'timetableId'>

const schema: yup.ObjectSchema<CreateClassRequestInternal> = yup.object().shape({
    courseId: yup.number().required('Course is required').typeError('Course is required'),
    teacherId: yup.number().required('Teacher is required').typeError('Teacher must be a number'),
    length: yup.number().required('Length is required').positive('Length must be positive')
        .typeError('Length must be a number'),
    frequency: yup.number().required('Frequency is required').positive('Frequency must be positive')
        .typeError('Frequency must be a number'),
    periodPreferencesList: yup.array().of(periodPreferenceSchema)
        .min(1, 'At least one Period preference is required')
        .required('Period preferences are required'),
});

const ClassCreationPage: React.FC = () => {
    const {timetableId} = useParams<{ timetableId: string }>();
    const [courses, setCourses] = useState<Course[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [timetableStructure, setTimetableStructure] = useState<TimetableStructure | null >(null);
    const [loadingStructure, setLoadingStructure] = useState<boolean>(true);
    const [loadingCourses, setLoadingCourses] = useState<boolean>(true);
    const [loadingTeachers, setLoadingTeachers] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const {
        register,
        handleSubmit,
        control,
        setValue,
        formState: {errors},
        reset,
    } = useForm<CreateClassRequestInternal>({
        resolver: yupResolver(schema),
        defaultValues: {
            courseId: -1,
            teacherId: -1,
            length: 0,
            frequency: 0,
            periodPreferencesList: [],
        },
        mode: 'onBlur',
    });

    const sortedPeriods = useMemo(() => {
        if (!timetableStructure?.periods) return [];
        return [...timetableStructure.periods].sort((a, b) =>
            dayjs(a.start, 'HH:mm').diff(dayjs(b.start, 'HH:mm'))
        );
    }, [timetableStructure?.periods]);

    const fetchData = useCallback(async <T, >(
        fetchFn: () => Promise<T>,
        setData: React.Dispatch<React.SetStateAction<T>>,
        setLoading: React.Dispatch<React.SetStateAction<boolean>>,
        setErrorMsg: string
    ): Promise<boolean> => {
        setLoading(true);
        try {
            const data = await fetchFn();
            setData(data);
            return true;
        } catch (err) {
            console.error(setErrorMsg, err);
            setFetchError(prev => `${prev ? prev + '; ' : ''}${setErrorMsg}: ${err instanceof Error ? err.message : 'Unknown error'}`);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const {fields, remove, append} = useFieldArray({
        control,
        name: 'periodPreferencesList',
    })

    useEffect(() => {
        if (!timetableId) {
            setFetchError('No timetable ID provided in URL.');
            setLoadingStructure(false);
            setLoadingCourses(false);
            setLoadingTeachers(false);
            return;
        }
        setFetchError(null);
        setLoadingStructure(true);
        setLoadingCourses(true);
        setLoadingTeachers(true);
        const loadAllData = async () => {
            const structureSuccess = await fetchData(
                () => fetchTimetableStructureById(timetableId),
                setTimetableStructure,
                setLoadingStructure,
                'Failed to load timetable structure'
            );
            if (structureSuccess) {
                await Promise.all([
                    fetchData(fetchCourses, setCourses, setLoadingCourses, 'Failed to load courses'),
                    fetchData(fetchTeachers, setTeachers, setLoadingTeachers, 'Failed to load teachers')
                ]);
            } else {
                setLoadingCourses(false);
                setLoadingTeachers(false);
            }
        };
        loadAllData();
    }, [timetableId, fetchData, setValue]);

    const onSubmit: SubmitHandler<CreateClassRequest> = async (data) => {
        setSubmitStatus(null);
        setIsSubmitting(true);
        try {
            data = {...data, timetableId: Number(timetableId)};
            console.log('Submitting class creation:', data);
            const result = await createClass(data);
            console.log('Class creation successful:', result);
            setSubmitStatus({
                type: 'success',
                message: `Class "${result.courseDto.name}" created successfully! (ID: ${result.id})`
            });
            reset();
        } catch (err) {
            console.error('Error creating class:', err);
            const apiErrorMessage = err instanceof Error ? err.message : 'Failed to create class.';
            setSubmitStatus({type: 'error', message: `Submission Error: ${apiErrorMessage}`});
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loadingStructure) {
        return (
            <Container maxWidth="md">
                <Typography variant="h4" gutterBottom>
                    Create New Class for Timetable...
                </Typography>
                <Skeleton variant="text" height={60}/>
                <Skeleton variant="rectangular" height={56} sx={{mt: 2}}/>
                <Skeleton variant="rectangular" height={56} sx={{mt: 2}}/>
                <Skeleton variant="text" height={40} sx={{mt: 3}}/>
                <Skeleton variant="rectangular" height={70} sx={{mt: 1}}/>
                <Skeleton variant="rectangular" height={40} width={150} sx={{mt: 2}}/>
                <Skeleton variant="rectangular" height={56} sx={{mt: 3}}/>
            </Container>
        );
    }
    if (fetchError && !timetableStructure) {
        return (
            <Container maxWidth="md">
                <Typography variant="h4" gutterBottom color="error">
                    Error Loading Page Data
                </Typography>
                <Alert severity="error" sx={{mt: 2}}>
                    Could not load essential timetable data. Please try again later.
                    <br/>
                    Details: {fetchError}
                </Alert>
            </Container>
        );
    }
    if (!timetableStructure) {
        return (
            <Container maxWidth="md">
                <Typography sx={{mt: 2}}>Could not load timetable structure for ID: {timetableId}. Cannot create
                    class.</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="md">
            <Typography variant="h4" gutterBottom>
                Create New Class for Timetable: {timetableStructure.name}
            </Typography>

            {/* Error messages */}
            {fetchError && timetableStructure && (
                <Alert severity="warning" sx={{mt: 2, mb: 2}}>
                    Warning: Some data failed to load, functionality may be limited. Details: {fetchError}
                </Alert>
            )}
            {submitStatus && (
                <Alert severity={submitStatus.type} sx={{mt: 2, mb: 2}}>
                    {submitStatus.message}
                </Alert>
            )}

            {/* Form */}
            <Box
                component="form"
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                sx={{mt: 1}}
            >
                <FormControl
                    fullWidth
                    required
                    margin="normal"
                    disabled={isSubmitting || loadingCourses}
                    error={!!errors.courseId}
                >
                    <InputLabel id="course-select-label">Course</InputLabel>
                    <Select
                        labelId="course-select-label"
                        id="course-select"
                        {...register("courseId")}
                        label="Course *"
                        error={!!errors.courseId}
                        renderValue={(selected) => {
                            if (loadingCourses) return <Skeleton variant="text" width="80%"/>;
                            if (!selected) return <em>Select a Course</em>;
                            const course = courses.find(c => c.id === Number(selected));
                            return course ? `${course.name} (${course.code})` : '';
                        }}
                    >
                        <MenuItem value="" disabled={loadingCourses}>
                            <em>{loadingCourses ? 'Loading...' : 'Select a Course'}</em>
                        </MenuItem>
                        {!loadingCourses && courses.map((course) => (
                            <MenuItem key={course.id} value={course.id}>
                                {course.name} ({course.code})
                            </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText error={!!errors.courseId}>
                        {errors.courseId?.message || (loadingCourses ? 'Loading courses...' : ' ')}
                    </FormHelperText>
                </FormControl>

                {/* Teacher Selection */}
                <FormControl
                    fullWidth
                    margin="normal"
                    disabled={isSubmitting || loadingTeachers}
                    error={!!errors.teacherId}
                >
                    <InputLabel id="teacher-select-label">Teacher</InputLabel>
                    <Select
                        labelId="teacher-select-label"
                        id="teacher-select"
                        {...register("teacherId")}
                        label="Teacher"
                        renderValue={(selected) => {
                            if (loadingTeachers) return <Skeleton variant="text" width="80%"/>;
                            if (!selected) return <em>None</em>;
                            const teacher = teachers.find(t => t.id === Number(selected));
                            return teacher ? `${teacher.name} (${teacher.type})` : '';
                        }}
                    >
                        <MenuItem value="">
                            <em>{loadingTeachers ? 'Loading...' : 'None'}</em>
                        </MenuItem>
                        {!loadingTeachers && teachers.map((teacher) => (
                            <MenuItem key={teacher.id} value={teacher.id}>
                                {teacher.name} ({teacher.type})
                            </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText error={!!errors.teacherId}>
                        {errors.teacherId?.message || (loadingTeachers ? 'Loading teachers...' : ' ')}
                    </FormHelperText>
                </FormControl>

                {/* Length Input */}
                <TextField
                    required
                    fullWidth
                    label="Periods length"
                    type="number"
                    {...register("length")}
                    InputProps={{
                        inputProps: {min: 1, step: 1}
                    }}
                    sx={{width: {xs: '100%', sm: 120}}}
                    disabled={isSubmitting}
                    error={!!errors.length}
                    helperText={errors.length?.message}
                />

                {/* Frequency input */}
                <TextField
                    fullWidth
                    required
                    label="Frequency"
                    type="number"
                    {...register("frequency")}
                    InputProps={{
                        inputProps: {min: 1, step: 1}
                    }}
                    sx={{width: {xs: '100%', sm: 120}}}
                    disabled={isSubmitting}
                    error={!!errors.frequency}
                    helperText={errors.frequency?.message}
                />

                <Typography variant="h6" gutterBottom sx={{mt: 3}}>
                    Period preferences *
                </Typography>
                {/* Occurrences List */}
                <Stack spacing={2} sx={{mb: 2}}>
                    <OccurrenceFormList
                        control={control}
                        fields={fields}
                        remove={remove}
                        sortedPeriods={sortedPeriods}
                        errors={errors}
                    >

                    </OccurrenceFormList>
                    {errors.periodPreferencesList && (
                        <FormHelperText error>{errors.periodPreferencesList.message}</FormHelperText>
                    )}
                </Stack>

                <Button
                    variant="outlined"
                    startIcon={<AddCircleOutlineIcon/>}
                    onClick={() => append({startPeriodId: -1})}
                    sx={{mb: 3}}
                    disabled={isSubmitting}
                    aria-label="Add schedule occurrence"
                >
                    ADD PERIOD
                </Button>

                {/* Submit Button */}
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{mt: 3, mb: 2}}
                    disabled={isSubmitting || loadingStructure || loadingCourses || loadingTeachers} // Disable during any loading or submission
                    aria-busy={isSubmitting}
                >
                    {isSubmitting ? <CircularProgress size={24} color="inherit"/> : 'Create Class'}
                </Button>
            </Box>
        </Container>
    );
};

export default ClassCreationPage;