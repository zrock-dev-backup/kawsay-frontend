// src/pages/ClassCreationPage.tsx

import React, { useState, useEffect } from 'react';
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
    FormLabel,
    InputAdornment,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';

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

// Define a type for the UI state of a single occurrence in the form
interface OccurrenceFormState {
    id: number; // Unique ID for form management (not API ID)
    dayId: number | ''; // Selected day ID
    startPeriodId: number | ''; // Selected start period ID
    length: number | ''; // Number of periods
}

const ClassCreationPage: React.FC = () => {
    // Get timetableId from URL params
    const { timetableId } = useParams<{ timetableId: string }>();
    const navigate = useNavigate();

    // State for fetched data
    const [courses, setCourses] = useState<Course[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [timetableStructure, setTimetableStructure] = useState<TimetableStructure | null>(null);

    // State for form inputs
    const [selectedCourseId, setSelectedCourseId] = useState<number | ''>('');
    const [selectedTeacherId, setSelectedTeacherId] = useState<number | ''>(''); // Use number | '' for optional ID
    const [occurrences, setOccurrences] = useState<OccurrenceFormState[]>([]);
    const [nextOccurrenceFormId, setNextOccurrenceFormId] = useState(1); // For managing form occurrence IDs

    // State for loading and submission
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // Fetch initial data (courses, teachers, timetable structure)
    useEffect(() => {
        if (!timetableId) {
            setError('No timetable ID provided in URL.');
            setLoading(false);
            return;
        }

        const loadInitialData = async () => {
            setLoading(true);
            setError(null);
            try {
                console.log('Fetching initial data for class creation...');
                const [coursesData, teachersData, timetableData] = await Promise.all([
                    fetchCourses(),
                    fetchTeachers(),
                    fetchTimetableStructureById(timetableId)
                ]);

                console.log('Initial data fetched:', { coursesData, teachersData, timetableData });

                setCourses(coursesData);
                setTeachers(teachersData);
                setTimetableStructure(timetableData);

            } catch (err) {
                console.error('Error fetching initial data:', err);
                setError(err instanceof Error ? err.message : 'Failed to load data for class creation.');
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();

    }, [timetableId]); // Re-run effect if timetableId changes

    // Handlers for form inputs
    const handleCourseChange = (event: SelectChangeEvent<number | ''>) => {
        setSelectedCourseId(event.target.value as number | '');
        setSubmitStatus(null);
    };

    const handleTeacherChange = (event: SelectChangeEvent<number | ''>) => {
        setSelectedTeacherId(event.target.value as number | '');
        setSubmitStatus(null);
    };

    const handleAddOccurrence = () => {
        setOccurrences(prevOccurrences => [
            ...prevOccurrences,
            { id: nextOccurrenceFormId, dayId: '', startPeriodId: '', length: '' }
        ]);
        setNextOccurrenceFormId(prevId => prevId + 1);
        setSubmitStatus(null);
    };

    const handleRemoveOccurrence = (idToRemove: number) => {
        setOccurrences(prevOccurrences => prevOccurrences.filter(occ => occ.id !== idToRemove));
        setSubmitStatus(null);
    };

    const handleOccurrenceChange = (
        id: number,
        field: keyof Omit<OccurrenceFormState, 'id'>, // Only allow changing dayId, startPeriodId, length
        value: number | string | ''
    ) => {
        setOccurrences(prevOccurrences =>
            prevOccurrences.map(occ =>
                occ.id === id ? { ...occ, [field]: value } : occ
            )
        );
        setSubmitStatus(null);
    };

    // Form Submission
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setSubmitStatus(null);
        setError(null); // Clear general error

        if (!timetableId) {
             setError('Timetable ID is missing.');
             return;
        }

        // Basic validation
        if (!selectedCourseId) {
            setError('Please select a Course.');
            return;
        }
        if (occurrences.length === 0) {
            setError('Please add at least one Occurrence.');
            return;
        }

        // Validate each occurrence
        const invalidOccurrence = occurrences.find(occ =>
            occ.dayId === '' || occ.startPeriodId === '' || occ.length === '' || Number(occ.length) <= 0
        );
        if (invalidOccurrence) {
            setError('Please ensure all Occurrence fields (Day, Start Time, Length) are filled and Length is positive.');
            return;
        }

        // Map form state to API request format
        const apiOccurrences: Omit<ClassOccurrence, 'id'>[] = occurrences.map(occ => ({
            dayId: Number(occ.dayId),
            startPeriodId: Number(occ.startPeriodId),
            length: Number(occ.length),
        }));

        const apiPayload: CreateClassRequest = {
            timetableId: Number(timetableId),
            courseId: Number(selectedCourseId),
            teacherId: selectedTeacherId === '' ? null : Number(selectedTeacherId), // Send null if no teacher selected
            occurrences: apiOccurrences,
        };

        setIsSubmitting(true);

        try {
            console.log('Submitting class creation:', apiPayload);
            const result = await createClass(apiPayload);
            console.log('Class creation successful:', result);
            setSubmitStatus({ type: 'success', message: `Class "${result.course.name}" created successfully! (ID: ${result.id})` });

            // Optionally redirect to the timetable grid page after success
            // navigate(`/table/${timetableId}`);

            // Or clear the form to add another class
             setSelectedCourseId('');
             setSelectedTeacherId('');
             setOccurrences([]);
             setNextOccurrenceFormId(1);

        } catch (err) {
            console.error('Error creating class:', err);
            setSubmitStatus({ type: 'error', message: err instanceof Error ? err.message : 'Failed to create class.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Render Logic ---

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading data for class creation...</Typography>
            </Box>
        );
    }

    if (error && !timetableStructure) {
        return (
            <Container>
                <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
            </Container>
        );
    }

    if (!timetableStructure) {
         return (
             <Container>
                 <Typography sx={{ mt: 2 }}>Could not load timetable structure for ID: {timetableId}. Cannot create class.</Typography>
             </Container>
         );
    }


    return (
        <Container maxWidth="md">
            <Typography variant="h4" gutterBottom>
                Create New Class for Timetable: {timetableStructure.name} (ID: {timetableId})
            </Typography>

            {/* Status Alert */}
            {submitStatus && (
                <Alert severity={submitStatus.type} sx={{ mt: 2, mb: 2 }}>
                    {submitStatus.message}
                </Alert>
            )}
             {/* General Error Alert (for validation issues) */}
            {error && !isSubmitting && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}


            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>

                {/* Course Selection */}
                <FormControl fullWidth required margin="normal" disabled={isSubmitting}>
                    <InputLabel id="course-select-label">Course</InputLabel>
                    <Select
                        labelId="course-select-label"
                        id="course-select"
                        value={selectedCourseId}
                        label="Course"
                        onChange={handleCourseChange}
                    >
                        <MenuItem value="">
                            <em>Select a Course</em>
                        </MenuItem>
                        {courses.map((course) => (
                            <MenuItem key={course.id} value={course.id}>
                                {course.name} ({course.code})
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Teacher Selection */}
                <FormControl fullWidth margin="normal" disabled={isSubmitting}>
                    <InputLabel id="teacher-select-label">Teacher (Optional)</InputLabel>
                    <Select
                        labelId="teacher-select-label"
                        id="teacher-select"
                        value={selectedTeacherId}
                        label="Teacher (Optional)"
                        onChange={handleTeacherChange}
                    >
                        <MenuItem value="">
                            <em>None</em>
                        </MenuItem>
                        {teachers.map((teacher) => (
                            <MenuItem key={teacher.id} value={teacher.id}>
                                {teacher.name} ({teacher.type})
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Schedule Occurrences *
                </Typography>

                {/* Occurrences List */}
                <Stack spacing={2} sx={{ mb: 2 }}>
                    {occurrences.map((occurrence) => (
                        <Paper
                            key={occurrence.id}
                            elevation={2}
                            sx={{ p: 2, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 2 }}
                        >
                            {/* Day Selection for Occurrence */}
                            <FormControl required sx={{ minWidth: 120, flexGrow: 1 }} disabled={isSubmitting}>
                                <InputLabel id={`day-select-label-${occurrence.id}`}>Day</InputLabel>
                                <Select
                                    labelId={`day-select-label-${occurrence.id}`}
                                    id={`day-select-${occurrence.id}`}
                                    value={occurrence.dayId}
                                    label="Day"
                                    onChange={(e) => handleOccurrenceChange(occurrence.id, 'dayId', e.target.value as number)}
                                >
                                     <MenuItem value=""><em>Select Day</em></MenuItem>
                                    {timetableStructure.days.map((day) => (
                                        <MenuItem key={day.id} value={day.id}>
                                            {day.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {/* Start Period Selection for Occurrence */}
                             <FormControl required sx={{ minWidth: 120, flexGrow: 1 }} disabled={isSubmitting}>
                                <InputLabel id={`period-select-label-${occurrence.id}`}>Start Time</InputLabel>
                                <Select
                                    labelId={`period-select-label-${occurrence.id}`}
                                    id={`period-select-${occurrence.id}`}
                                    value={occurrence.startPeriodId}
                                    label="Start Time"
                                    onChange={(e) => handleOccurrenceChange(occurrence.id, 'startPeriodId', e.target.value as number)}
                                >
                                    <MenuItem value=""><em>Select Time</em></MenuItem>
                                    {/* Sort periods chronologically for better UX */}
                                    {[...timetableStructure.periods].sort((a, b) => dayjs(a.start, 'HH:mm').diff(dayjs(b.start, 'HH:mm')))}
                                    .map((period) => (
                                        <MenuItem key={period.id} value={period.id}>
                                            {`${period.start} - ${period.end}`}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {/* Length Input for Occurrence */}
                            <TextField
                                required
                                label="Length"
                                type="number"
                                value={occurrence.length}
                                onChange={(e) => handleOccurrenceChange(occurrence.id, 'length', e.target.value)}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">periods</InputAdornment>,
                                    inputProps: { min: 1 } // Minimum length is 1
                                }}
                                sx={{ width: { xs: '100%', sm: 100 } }}
                                disabled={isSubmitting}
                            />


                            {/* Remove Occurrence Button */}
                            <IconButton
                                aria-label="delete occurrence"
                                onClick={() => handleRemoveOccurrence(occurrence.id)}
                                color="error"
                                disabled={isSubmitting}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Paper>
                    ))}
                    {occurrences.length === 0 && !isSubmitting && (
                        <Typography color="text.secondary">Add at least one occurrence.</Typography>
                    )}
                </Stack>

                {/* Add Occurrence Button */}
                <Button
                    variant="outlined"
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={handleAddOccurrence}
                    sx={{ mb: 3 }}
                    disabled={isSubmitting}
                >
                    Add Occurrence
                </Button>

                {/* Create Class Button */}
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    disabled={!selectedCourseId || occurrences.length === 0 || isSubmitting || occurrences.some(occ => occ.dayId === '' || occ.startPeriodId === '' || occ.length === '' || Number(occ.length) <= 0)}
                >
                    {isSubmitting ? <CircularProgress size={24} /> : 'Create Class'}
                </Button>
            </Box>
        </Container>
    );
};

export default ClassCreationPage;
