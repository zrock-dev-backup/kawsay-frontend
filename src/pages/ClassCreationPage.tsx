import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    SelectChangeEvent,
    Paper,
    IconButton,
    Grid,
    FormHelperText,
    InputAdornment,
    Skeleton,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import type {
    Course,
    Teacher,
    TimetableStructure,
    ClassOccurrence,
    CreateClassRequest,
    TimetableDay,
    TimetablePeriod
} from '../interfaces/apiDataTypes';
import {
    fetchCourses,
    fetchTeachers,
    fetchTimetableStructureById,
    createClass
} from '../services/apiService';
dayjs.extend(customParseFormat);
interface OccurrenceFormState {
    id: number;
    dayId: number | null;
    startPeriodId: number | null;
    length: number | string;
}
interface FormValidationErrors {
    courseId?: string;
    teacherId?: string;
    occurrences?: string;
    occurrenceFields?: { [key: number]: { dayId?: string; startPeriodId?: string; length?: string } };
    submit?: string;
}
const ClassCreationPage: React.FC = () => {
    const { timetableId } = useParams<{ timetableId: string }>();
    const navigate = useNavigate();
    const [courses, setCourses] = useState<Course[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [timetableStructure, setTimetableStructure] = useState<TimetableStructure | null>(null);
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
    const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
    const [occurrences, setOccurrences] = useState<OccurrenceFormState[]>([]);
    const [nextOccurrenceFormId, setNextOccurrenceFormId] = useState(1);
    const [loadingStructure, setLoadingStructure] = useState<boolean>(true);
    const [loadingCourses, setLoadingCourses] = useState<boolean>(true);
    const [loadingTeachers, setLoadingTeachers] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<FormValidationErrors>({});
    const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const fetchData = useCallback(async <T,>(
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
    }, [timetableId, fetchData]);
    const sortedPeriods = useMemo(() => {
        if (!timetableStructure?.periods) return [];
        return [...timetableStructure.periods].sort((a, b) =>
            dayjs(a.start, 'HH:mm').diff(dayjs(b.start, 'HH:mm'))
        );
    }, [timetableStructure?.periods]);
    const validateOccurrence = (occ: OccurrenceFormState): { dayId?: string; startPeriodId?: string; length?: string } => {
        const errors: { dayId?: string; startPeriodId?: string; length?: string } = {};
        if (occ.dayId === null) errors.dayId = 'Required';
        if (occ.startPeriodId === null) errors.startPeriodId = 'Required';
        if (occ.length === '' || Number(occ.length) <= 0) errors.length = 'Must be > 0';
        else if (isNaN(Number(occ.length))) errors.length = 'Must be a number';
        else if (timetableStructure && occ.startPeriodId !== null) {
            const startIndex = sortedPeriods.findIndex(p => p.id === occ.startPeriodId);
            if (startIndex !== -1 && startIndex + Number(occ.length) > sortedPeriods.length) {
                errors.length = `Exceeds available periods (${sortedPeriods.length - startIndex})`;
            }
        }
        return errors;
    };
    const validateForm = useCallback((): boolean => {
        const errors: FormValidationErrors = { occurrenceFields: {} };
        let isValid = true;
        if (selectedCourseId === null) {
            errors.courseId = 'Please select a Course.';
            isValid = false;
        }
        if (occurrences.length === 0) {
            errors.occurrences = 'Please add at least one Occurrence.';
            isValid = false;
        } else {
            occurrences.forEach(occ => {
                const occErrors = validateOccurrence(occ);
                if (Object.keys(occErrors).length > 0) {
                    errors.occurrenceFields![occ.id] = occErrors;
                    isValid = false;
                }
            });
        }
        setValidationErrors(errors);
        return isValid;
    }, [selectedCourseId, occurrences, timetableStructure, sortedPeriods]);
    const handleCourseChange = useCallback((event: SelectChangeEvent<number | null>) => {
        const value = event.target.value === '' ? null : (event.target.value as number);
        setSelectedCourseId(value);
        setSubmitStatus(null);
        setValidationErrors(prev => ({ ...prev, courseId: undefined }));
    }, []);
    const handleTeacherChange = useCallback((event: SelectChangeEvent<number | null>) => {
        const value = event.target.value === '' ? null : (event.target.value as number);
        setSelectedTeacherId(value);
        setSubmitStatus(null);
    }, []);
    const handleAddOccurrence = useCallback(() => {
        setOccurrences(prevOccurrences => [
            ...prevOccurrences,
            { id: nextOccurrenceFormId, dayId: null, startPeriodId: null, length: '' }
        ]);
        setNextOccurrenceFormId(prevId => prevId + 1);
        setSubmitStatus(null);
        setValidationErrors(prev => ({ ...prev, occurrences: undefined }));
    }, [nextOccurrenceFormId]);
    const handleRemoveOccurrence = useCallback((idToRemove: number) => {
        setOccurrences(prevOccurrences => prevOccurrences.filter(occ => occ.id !== idToRemove));
        setSubmitStatus(null);
        setValidationErrors(prev => {
            const newOccFields = { ...prev.occurrenceFields };
            delete newOccFields[idToRemove];
            return { ...prev, occurrenceFields: newOccFields };
        });
    }, []);
    const handleOccurrenceChange = useCallback((
        id: number,
        field: keyof Omit<OccurrenceFormState, 'id'>,
        value: number | string | null
    ) => {
        setOccurrences(prevOccurrences =>
            prevOccurrences.map(occ =>
                occ.id === id ? { ...occ, [field]: value } : occ
            )
        );
        setSubmitStatus(null);
        setValidationErrors(prev => {
            const newOccFields = { ...prev.occurrenceFields };
            if (newOccFields[id]) {
                delete newOccFields[id][field];
                if (Object.keys(newOccFields[id]).length === 0) {
                    delete newOccFields[id];
                }
            }
            return { ...prev, occurrenceFields: newOccFields };
        });
    }, []);
    const handleSubmit = useCallback(async (event: React.FormEvent) => {
        event.preventDefault();
        setSubmitStatus(null);
        setValidationErrors({});
        if (!validateForm() || !timetableId || selectedCourseId === null) {
             setValidationErrors(prev => ({ ...prev, submit: 'Please fix the errors above.'}))
             return;
        }
        const apiOccurrences: Omit<ClassOccurrence, 'id'>[] = occurrences.map(occ => ({
            dayId: occ.dayId!,
            startPeriodId: occ.startPeriodId!,
            length: Number(occ.length),
        }));
        const apiPayload: CreateClassRequest = {
            timetableId: Number(timetableId),
            courseId: selectedCourseId,
            teacherId: selectedTeacherId,
            occurrences: apiOccurrences,
        };
        setIsSubmitting(true);
        try {
            console.log('Submitting class creation:', apiPayload);
            const result = await createClass(apiPayload);
            console.log('Class creation successful:', result);
            setSubmitStatus({ type: 'success', message: `Class "${result.courseDto.name}" created successfully! (ID: ${result.id})` });
             setSelectedCourseId(null);
             setSelectedTeacherId(null);
             setOccurrences([]);
             setNextOccurrenceFormId(1);
             setValidationErrors({});
        } catch (err) {
            console.error('Error creating class:', err);
            const apiErrorMessage = err instanceof Error ? err.message : 'Failed to create class.';
            setSubmitStatus({ type: 'error', message: `Submission Error: ${apiErrorMessage}` });
             setValidationErrors(prev => ({ ...prev, submit: apiErrorMessage }));
        } finally {
            setIsSubmitting(false);
        }
    }, [validateForm, timetableId, selectedCourseId, selectedTeacherId, occurrences]);
    if (loadingStructure) {
        return (
            <Container maxWidth="md">
                 <Typography variant="h4" gutterBottom>
                     Create New Class for Timetable...
                 </Typography>
                <Skeleton variant="text" height={60} />
                <Skeleton variant="rectangular" height={56} sx={{ mt: 2 }} />
                <Skeleton variant="rectangular" height={56} sx={{ mt: 2 }} />
                <Skeleton variant="text" height={40} sx={{ mt: 3 }}/>
                 <Skeleton variant="rectangular" height={70} sx={{ mt: 1 }}/>
                 <Skeleton variant="rectangular" height={40} width={150} sx={{ mt: 2 }}/>
                 <Skeleton variant="rectangular" height={56} sx={{ mt: 3 }}/>
            </Container>
        );
    }
    // Error State (If structure failed to load)
    if (fetchError && !timetableStructure) {
        return (
            <Container maxWidth="md">
                <Typography variant="h4" gutterBottom color="error">
                    Error Loading Page Data
                </Typography>
                <Alert severity="error" sx={{ mt: 2 }}>
                    Could not load essential timetable data. Please try again later.
                    <br />
                    Details: {fetchError}
                </Alert>
                {/* Optional: Add a retry button here */}
            </Container>
        );
    }
    if (!timetableStructure) {
         return (
             <Container maxWidth="md">
                 <Typography sx={{ mt: 2 }}>Could not load timetable structure for ID: {timetableId}. Cannot create class.</Typography>
             </Container>
         );
    }
    return (
        <Container maxWidth="md">
            <Typography variant="h4" gutterBottom>
                Create New Class for Timetable: {timetableStructure.name} (ID: {timetableId})
            </Typography>
            {/* Display general fetch errors that occurred after structure loaded */}
             {fetchError && timetableStructure && (
                <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
                    Warning: Some data failed to load, functionality may be limited. Details: {fetchError}
                </Alert>
             )}
            {submitStatus && (
                <Alert severity={submitStatus.type} sx={{ mt: 2, mb: 2 }}>
                    {submitStatus.message}
                </Alert>
            )}
             {/* Display general validation error related to submit */}
            {validationErrors.submit && !isSubmitting && (
                 <Alert severity="warning" sx={{ mb: 2 }}>{validationErrors.submit}</Alert>
             )}
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                <FormControl
                    fullWidth
                    required
                    margin="normal"
                    disabled={isSubmitting || loadingCourses}
                    error={!!validationErrors.courseId}
                 >
                    <InputLabel id="course-select-label">Course</InputLabel>
                    <Select
                        labelId="course-select-label"
                        id="course-select"
                        value={selectedCourseId ?? ''} // Use '' for Select value when null
                        label="Course *" // Add asterisk for visual cue
                        onChange={handleCourseChange}
                        renderValue={(selected) => { // Handle display when loading
                            if (loadingCourses) return <Skeleton variant="text" width="80%"/>;
                            if (selected === null || selected === '') return <em>Select a Course</em>;
                            const course = courses.find(c => c.id === selected);
                            return course ? `${course.name} (${course.code})` : '';
                        }}
                        aria-describedby="course-helper-text"
                    >
                         {/* Placeholder */}
                        <MenuItem value="" disabled={loadingCourses}>
                            <em>{loadingCourses ? 'Loading...' : 'Select a Course'}</em>
                        </MenuItem>
                        {/* Course Options */}
                        {!loadingCourses && courses.map((course) => (
                            <MenuItem key={course.id} value={course.id}>
                                {course.name} ({course.code})
                            </MenuItem>
                        ))}
                    </Select>
                     {/* Validation Helper Text */}
                    <FormHelperText id="course-helper-text" error={!!validationErrors.courseId}>
                        {validationErrors.courseId || (loadingCourses ? 'Loading courses...' : ' ')} {/* Show loading or error */}
                    </FormHelperText>
                </FormControl>
                {/* Teacher Selection */}
                <FormControl
                    fullWidth
                    margin="normal"
                    disabled={isSubmitting || loadingTeachers}
                 >
                    <InputLabel id="teacher-select-label">Teacher (Optional)</InputLabel>
                    <Select
                        labelId="teacher-select-label"
                        id="teacher-select"
                        value={selectedTeacherId ?? ''}
                        label="Teacher (Optional)"
                        onChange={handleTeacherChange}
                        renderValue={(selected) => {
                            if (loadingTeachers) return <Skeleton variant="text" width="80%"/>;
                             if (selected === null || selected === '') return <em>None</em>;
                            const teacher = teachers.find(t => t.id === selected);
                            return teacher ? `${teacher.name} (${teacher.type})` : '';
                         }}
                    >
                         {/* Placeholder */}
                        <MenuItem value="">
                            <em>{loadingTeachers ? 'Loading...' : 'None'}</em>
                        </MenuItem>
                        {/* Teacher Options */}
                        {!loadingTeachers && teachers.map((teacher) => (
                            <MenuItem key={teacher.id} value={teacher.id}>
                                {teacher.name} ({teacher.type})
                            </MenuItem>
                        ))}
                    </Select>
                     <FormHelperText>
                        {loadingTeachers ? 'Loading teachers...' : ' '}
                     </FormHelperText>
                </FormControl>
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Schedule Occurrences *
                     {validationErrors.occurrences && ( // Display general occurrence error
                        <Typography component="span" color="error.main" variant="caption" sx={{ ml: 1 }}>
                             ({validationErrors.occurrences})
                         </Typography>
                     )}
                </Typography>
                {/* Occurrences List */}
                <Stack spacing={2} sx={{ mb: 2 }}>
                    {occurrences.map((occurrence, index) => {
                        const occErrors = validationErrors.occurrenceFields?.[occurrence.id] ?? {};
                        return (
                            <Paper
                                key={occurrence.id}
                                elevation={2}
                                sx={{ p: 2, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'flex-start', gap: 2 }}
                            >
                                {/* Day Selection */}
                                <FormControl required sx={{ minWidth: 120, flexGrow: 1 }} disabled={isSubmitting} error={!!occErrors.dayId}>
                                    <InputLabel id={`day-select-label-${occurrence.id}`}>Day</InputLabel>
                                    <Select
                                        labelId={`day-select-label-${occurrence.id}`}
                                        id={`day-select-${occurrence.id}`}
                                        value={occurrence.dayId ?? ''}
                                        label="Day *"
                                        onChange={(e) => handleOccurrenceChange(occurrence.id, 'dayId', e.target.value === '' ? null : Number(e.target.value))}
                                        aria-describedby={`day-helper-${occurrence.id}`}
                                    >
                                        <MenuItem value="" disabled><em>Select Day</em></MenuItem>
                                        {timetableStructure.days.map((day) => (
                                            <MenuItem key={day.id} value={day.id}>
                                                {day.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <FormHelperText id={`day-helper-${occurrence.id}`} error={!!occErrors.dayId}>{occErrors.dayId || ' '}</FormHelperText>
                                </FormControl>
                                <FormControl required sx={{ minWidth: 180, flexGrow: 1 }} disabled={isSubmitting} error={!!occErrors.startPeriodId}>
                                    <InputLabel id={`period-select-label-${occurrence.id}`}>Start Time</InputLabel>
                                    <Select
                                        labelId={`period-select-label-${occurrence.id}`}
                                        id={`period-select-${occurrence.id}`}
                                        value={occurrence.startPeriodId ?? ''}
                                        label="Start Time *"
                                        onChange={(e) => handleOccurrenceChange(occurrence.id, 'startPeriodId', e.target.value === '' ? null : Number(e.target.value))}
                                        aria-describedby={`period-helper-${occurrence.id}`}
                                    >
                                        <MenuItem value="" disabled><em>Select Time</em></MenuItem>
                                        {sortedPeriods.map((period) => (
                                            <MenuItem key={period.id} value={period.id}>
                                                {`${period.start} - ${period.end}`}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                     <FormHelperText id={`period-helper-${occurrence.id}`} error={!!occErrors.startPeriodId}>{occErrors.startPeriodId || ' '}</FormHelperText>
                                </FormControl>
                                {/* Length Input */}
                                <TextField
                                    required
                                    label="Length"
                                    type="number"
                                    id={`length-input-${occurrence.id}`}
                                    value={occurrence.length}
                                    onChange={(e) => handleOccurrenceChange(occurrence.id, 'length', e.target.value)} // Value is string here
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">periods</InputAdornment>,
                                        inputProps: { min: 1, step: 1 }
                                    }}
                                    sx={{ width: { xs: '100%', sm: 120 } }}
                                    disabled={isSubmitting}
                                    error={!!occErrors.length}
                                    helperText={occErrors.length || ' '}
                                    aria-describedby={`length-helper-${occurrence.id}`}
                                />
                                {/* Remove Occurrence Button */}
                                <IconButton
                                    aria-label={`delete occurrence ${index + 1}`}
                                    onClick={() => handleRemoveOccurrence(occurrence.id)}
                                    color="error"
                                    disabled={isSubmitting}
                                    sx={{ mt: { xs: 1, sm: 1 } }} // Adjust margin for alignment
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Paper>
                        );
                     })}
                    {occurrences.length === 0 && !isSubmitting && (
                        <Typography color="text.secondary">Add at least one occurrence using the button below.</Typography>
                    )}
                </Stack>
                <Button
                    variant="outlined"
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={handleAddOccurrence}
                    sx={{ mb: 3 }}
                    disabled={isSubmitting}
                    aria-label="Add schedule occurrence"
                >
                    Add Occurrence
                </Button>
                {/* Submit Button */}
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
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
