// src/pages/ClassCreationPage.tsx

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
    Grid, // Keep Grid if needed for layout, maybe not essential here
    FormHelperText, // For validation feedback
    InputAdornment,
    Skeleton, // For more granular loading feedback
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from 'dayjs'; // For sorting periods
import customParseFormat from 'dayjs/plugin/customParseFormat';

// Import API types and service functions
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

// Define a type for the UI state of a single occurrence in the form
interface OccurrenceFormState {
    id: number; // Unique ID for form management (not API ID)
    dayId: number | null; // Use null for unselected state
    startPeriodId: number | null; // Use null for unselected state
    length: number | string; // Allow string during input, parse to number later
}

// Define a type for validation errors
interface FormValidationErrors {
    courseId?: string;
    teacherId?: string; // Optional teacher, so less critical
    occurrences?: string; // General error for the occurrences section
    occurrenceFields?: { [key: number]: { dayId?: string; startPeriodId?: string; length?: string } }; // Specific errors per occurrence ID
    submit?: string; // Error related to submission itself
}

const ClassCreationPage: React.FC = () => {
    const { timetableId } = useParams<{ timetableId: string }>();
    const navigate = useNavigate();

    // --- State ---

    // Fetched Data State
    const [courses, setCourses] = useState<Course[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [timetableStructure, setTimetableStructure] = useState<TimetableStructure | null>(null);

    // Form Input State
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null); // Use null for unselected
    const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null); // Use null for unselected/optional
    const [occurrences, setOccurrences] = useState<OccurrenceFormState[]>([]);
    const [nextOccurrenceFormId, setNextOccurrenceFormId] = useState(1); // For managing form occurrence IDs

    // Loading State (more granular)
    const [loadingStructure, setLoadingStructure] = useState<boolean>(true);
    const [loadingCourses, setLoadingCourses] = useState<boolean>(true);
    const [loadingTeachers, setLoadingTeachers] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Error & Status State
    const [fetchError, setFetchError] = useState<string | null>(null); // Errors during initial data fetch
    const [validationErrors, setValidationErrors] = useState<FormValidationErrors>({});
    const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);


    // --- Data Fetching ---

    // Utility function to fetch data with loading/error state management
    const fetchData = useCallback(async <T,>(
        fetchFn: () => Promise<T>,
        setData: React.Dispatch<React.SetStateAction<T>>,
        setLoading: React.Dispatch<React.SetStateAction<boolean>>,
        setErrorMsg: string // Generic error message for this fetch
    ): Promise<boolean> => { // Returns true on success, false on failure
        setLoading(true);
        try {
            const data = await fetchFn();
            setData(data);
            return true; // Indicate success
        } catch (err) {
            console.error(setErrorMsg, err);
            // Append to general fetch error, don't overwrite other potential errors
            setFetchError(prev => `${prev ? prev + '; ' : ''}${setErrorMsg}: ${err instanceof Error ? err.message : 'Unknown error'}`);
            return false; // Indicate failure
        } finally {
            setLoading(false);
        }
    }, []); // No dependencies as it uses passed-in functions/state setters


    // Fetch initial data (structure, courses, teachers)
    useEffect(() => {
        if (!timetableId) {
            setFetchError('No timetable ID provided in URL.');
            setLoadingStructure(false);
            setLoadingCourses(false);
            setLoadingTeachers(false);
            return;
        }

        setFetchError(null); // Reset errors on new load
        setLoadingStructure(true);
        setLoadingCourses(true);
        setLoadingTeachers(true);

        const loadAllData = async () => {
            // Fetch structure first, as it's needed for context
            const structureSuccess = await fetchData(
                () => fetchTimetableStructureById(timetableId),
                setTimetableStructure,
                setLoadingStructure,
                'Failed to load timetable structure'
            );

            // Fetch courses and teachers in parallel if structure loaded successfully
            if (structureSuccess) {
                await Promise.all([
                    fetchData(fetchCourses, setCourses, setLoadingCourses, 'Failed to load courses'),
                    fetchData(fetchTeachers, setTeachers, setLoadingTeachers, 'Failed to load teachers')
                ]);
            } else {
                // If structure failed, don't bother loading others
                setLoadingCourses(false);
                setLoadingTeachers(false);
            }
        };

        loadAllData();

    }, [timetableId, fetchData]); // Include fetchData in dependencies

    // --- Derived Data (Memoized) ---
    const sortedPeriods = useMemo(() => {
        if (!timetableStructure?.periods) return [];
        // Sort periods chronologically for better UX in dropdown
        return [...timetableStructure.periods].sort((a, b) =>
            dayjs(a.start, 'HH:mm').diff(dayjs(b.start, 'HH:mm'))
        );
    }, [timetableStructure?.periods]);


    // --- Validation Logic ---

    // Function to validate a single occurrence
    const validateOccurrence = (occ: OccurrenceFormState): { dayId?: string; startPeriodId?: string; length?: string } => {
        const errors: { dayId?: string; startPeriodId?: string; length?: string } = {};
        if (occ.dayId === null) errors.dayId = 'Required';
        if (occ.startPeriodId === null) errors.startPeriodId = 'Required';
        if (occ.length === '' || Number(occ.length) <= 0) errors.length = 'Must be > 0';
        else if (isNaN(Number(occ.length))) errors.length = 'Must be a number';
        // Advanced validation: Check if length exceeds available periods (example)
        else if (timetableStructure && occ.startPeriodId !== null) {
            const startIndex = sortedPeriods.findIndex(p => p.id === occ.startPeriodId);
            if (startIndex !== -1 && startIndex + Number(occ.length) > sortedPeriods.length) {
                errors.length = `Exceeds available periods (${sortedPeriods.length - startIndex})`;
            }
        }
        return errors;
    };

    // Function to validate the entire form
    const validateForm = useCallback((): boolean => {
        const errors: FormValidationErrors = { occurrenceFields: {} };
        let isValid = true;

        // Validate Course
        if (selectedCourseId === null) {
            errors.courseId = 'Please select a Course.';
            isValid = false;
        }

        // Validate Occurrences (general and specific)
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
    }, [selectedCourseId, occurrences, timetableStructure, sortedPeriods]); // Dependencies for validation logic

    // --- Event Handlers (Memoized) ---

    const handleCourseChange = useCallback((event: SelectChangeEvent<number | null>) => { // Allow null
        const value = event.target.value === '' ? null : (event.target.value as number);
        setSelectedCourseId(value);
        setSubmitStatus(null);
        // Clear validation error for this field when changed
        setValidationErrors(prev => ({ ...prev, courseId: undefined }));
    }, []);

    const handleTeacherChange = useCallback((event: SelectChangeEvent<number | null>) => { // Allow null
        const value = event.target.value === '' ? null : (event.target.value as number);
        setSelectedTeacherId(value);
        setSubmitStatus(null);
    }, []);

    const handleAddOccurrence = useCallback(() => {
        setOccurrences(prevOccurrences => [
            ...prevOccurrences,
            { id: nextOccurrenceFormId, dayId: null, startPeriodId: null, length: '' } // Use null defaults
        ]);
        setNextOccurrenceFormId(prevId => prevId + 1);
        setSubmitStatus(null);
        // Clear general occurrence validation error when adding
        setValidationErrors(prev => ({ ...prev, occurrences: undefined }));
    }, [nextOccurrenceFormId]);

    const handleRemoveOccurrence = useCallback((idToRemove: number) => {
        setOccurrences(prevOccurrences => prevOccurrences.filter(occ => occ.id !== idToRemove));
        setSubmitStatus(null);
        // Clear specific errors for the removed occurrence
        setValidationErrors(prev => {
            const newOccFields = { ...prev.occurrenceFields };
            delete newOccFields[idToRemove];
            return { ...prev, occurrenceFields: newOccFields };
        });
    }, []);

    const handleOccurrenceChange = useCallback((
        id: number,
        field: keyof Omit<OccurrenceFormState, 'id'>,
        value: number | string | null // Allow null for selects
    ) => {
        setOccurrences(prevOccurrences =>
            prevOccurrences.map(occ =>
                occ.id === id ? { ...occ, [field]: value } : occ
            )
        );
        setSubmitStatus(null);
        // Clear validation error for the specific field being changed
        setValidationErrors(prev => {
            const newOccFields = { ...prev.occurrenceFields };
            if (newOccFields[id]) {
                delete newOccFields[id][field]; // Clear the specific field error
                if (Object.keys(newOccFields[id]).length === 0) {
                    delete newOccFields[id]; // Remove the entry if no errors left for this occurrence
                }
            }
            return { ...prev, occurrenceFields: newOccFields };
        });
    }, []);

    // Form Submission Handler
    const handleSubmit = useCallback(async (event: React.FormEvent) => {
        event.preventDefault();
        setSubmitStatus(null);
        setValidationErrors({}); // Clear previous submission errors

        // Perform validation
        if (!validateForm() || !timetableId || selectedCourseId === null) {
             // validateForm sets specific errors, maybe add a general submit error too
             setValidationErrors(prev => ({ ...prev, submit: 'Please fix the errors above.'}))
             return; // Stop submission if validation fails
        }

        // Map form state to API request format (only if validation passes)
        const apiOccurrences: Omit<ClassOccurrence, 'id'>[] = occurrences.map(occ => ({
            dayId: occ.dayId!, // Assert non-null because validation passed
            startPeriodId: occ.startPeriodId!, // Assert non-null because validation passed
            length: Number(occ.length), // Convert valid string/number to number
        }));

        const apiPayload: CreateClassRequest = {
            timetableId: Number(timetableId),
            courseId: selectedCourseId, // Already validated non-null
            teacherId: selectedTeacherId, // Can be null
            occurrences: apiOccurrences,
        };

        setIsSubmitting(true);

        try {
            console.log('Submitting class creation:', apiPayload);
            const result = await createClass(apiPayload);
            console.log('Class creation successful:', result);
            setSubmitStatus({ type: 'success', message: `Class "${result.course.name}" created successfully! (ID: ${result.id})` });

            // Clear the form for adding another class
             setSelectedCourseId(null);
             setSelectedTeacherId(null);
             setOccurrences([]);
             setNextOccurrenceFormId(1);
             setValidationErrors({}); // Clear validation errors on success

        } catch (err) {
            console.error('Error creating class:', err);
            // Set specific submission error from API if possible
            const apiErrorMessage = err instanceof Error ? err.message : 'Failed to create class.';
            setSubmitStatus({ type: 'error', message: `Submission Error: ${apiErrorMessage}` });
             // Also put it in the general validation errors for visibility
             setValidationErrors(prev => ({ ...prev, submit: apiErrorMessage }));
        } finally {
            setIsSubmitting(false);
        }
    }, [validateForm, timetableId, selectedCourseId, selectedTeacherId, occurrences]); // Include dependencies


    // --- Render Logic ---

    // Initial Loading State (Structure is critical)
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

    // Should not happen if loading is false and no error, but safeguard
    if (!timetableStructure) {
         return (
             <Container maxWidth="md">
                 <Typography sx={{ mt: 2 }}>Could not load timetable structure for ID: {timetableId}. Cannot create class.</Typography>
             </Container>
         );
    }

    // --- Main Form Render ---
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

            {/* Submission Status Alert */}
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

                {/* Course Selection */}
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
                        value={selectedTeacherId ?? ''} // Use '' for Select value when null
                        label="Teacher (Optional)"
                        onChange={handleTeacherChange}
                        renderValue={(selected) => { // Handle display when loading
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

                                {/* Start Period Selection */}
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
                                    aria-describedby={`length-helper-${occurrence.id}`} // Though helperText might cover it
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

                {/* Add Occurrence Button */}
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
