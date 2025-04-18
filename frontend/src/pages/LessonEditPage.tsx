// src/pages/LessonEditPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
    Container,
    Typography,
    Button,
    Box,
    Stack,
    CircularProgress,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    SelectChangeEvent,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat'; // Import plugin

import type { LessonApiData, LessonEditState } from '../interfaces/LessonEditData';

// Enable HH:mm parsing
dayjs.extend(customParseFormat);

// --- Mock API Functions ---
// Replace with your actual API calls

// Function to fetch initial lesson data
const fetchLessonData = async (lessonId: string): Promise<LessonApiData> => {
    console.log(`Fetching lesson data for ID: ${lessonId}...`);
    await new Promise(resolve => setTimeout(resolve, 800));

    // Simulate finding the lesson data
    // In reality, you'd fetch based on lessonId
    const mockLesson: LessonApiData = {
        // lessonId: parseInt(lessonId, 10), // Include if needed
        tStart: '09:15',
        tEnd: '10:45',
        day: 'Wednesday',
        subject: 'History Lecture',
    };

    // Simulate not found
    // if (lessonId === 'notfound') {
    //   throw new Error(`Lesson with ID ${lessonId} not found.`);
    // }

    console.log('Lesson data fetched:', mockLesson);
    return mockLesson;
};

// Function to update lesson data
const updateLessonAPI = async (lessonData: LessonApiData): Promise<{ success: boolean; message: string }> => {
    console.log('Sending updated lesson data to API:', lessonData);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call delay

    // Simulate success/failure
    const success = Math.random() > 0.2; // 80% chance of success

    if (success) {
        console.log('API Update Successful');
        return { success: true, message: 'Lesson updated successfully!' };
    } else {
        console.error('API Update Failed');
        return { success: false, message: 'Failed to update lesson on the server.' };
    }
};
// --- End Mock API Functions ---

// Define available days
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const LessonEditPage: React.FC = () => {
    // Assuming the route is like /edit-lesson/:lessonId
    const { lessonId } = useParams<{ lessonId: string }>();
    //const navigate = useNavigate();

    const [lessonState, setLessonState] = useState<LessonEditState | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);


    // Fetch initial data
    useEffect(() => {
        if (!lessonId) {
            setError('No Lesson ID provided in URL.');
            setLoading(false);
            return;
        }

        const loadInitialData = async () => {
            setLoading(true);
            setError(null);
            setSubmitStatus(null); // Clear previous submit messages
            try {
                const apiData = await fetchLessonData(lessonId);

                // Convert API string times to Dayjs objects for pickers
                setLessonState({
                    tStart: apiData.tStart ? dayjs(apiData.tStart, 'HH:mm') : null,
                    tEnd: apiData.tEnd ? dayjs(apiData.tEnd, 'HH:mm') : null,
                    day: apiData.day,
                    subject: apiData.subject,
                });
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load lesson data.');
                setLessonState(null); // Ensure state is null on error
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, [lessonId]); // Reload if lessonId changes

    // --- Input Change Handlers ---

    const handleTimeChange = useCallback((field: 'tStart' | 'tEnd', newValue: Dayjs | null) => {
        setLessonState(prevState => prevState ? { ...prevState, [field]: newValue } : null);
        setSubmitStatus(null); // Clear submit message on edit
    }, []);

    const handleDayChange = useCallback((event: SelectChangeEvent<string>) => {
        const newDay = event.target.value;
        setLessonState(prevState => prevState ? { ...prevState, day: newDay } : null);
        setSubmitStatus(null);
    }, []);

    // --- Form Submission ---

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!lessonState) return; // Should not happen if form is visible

        // Basic Validation
        if (!lessonState.tStart || !lessonState.tEnd || !lessonState.day || !lessonState.subject) {
            setError('All fields are required.');
            return;
        }
        if (lessonState.tEnd.isBefore(lessonState.tStart)) {
            setError('End time cannot be before start time.');
            return;
        }

        setError(null); // Clear validation errors
        setSubmitStatus(null);
        setIsSubmitting(true);

        // Prepare data for API (convert Dayjs back to HH:mm strings)
        const apiPayload: LessonApiData = {
            // lessonId: parseInt(lessonId!, 10), // Include ID if your API needs it
            tStart: lessonState.tStart.format('HH:mm'),
            tEnd: lessonState.tEnd.format('HH:mm'),
            day: lessonState.day,
            subject: lessonState.subject,
        };

        try {
            const result = await updateLessonAPI(apiPayload);
            setSubmitStatus({ type: result.success ? 'success' : 'error', message: result.message });
            if (result.success) {
                // Optional: Navigate back or show persistent success
                // setTimeout(() => navigate('/previous-page'), 1500); // Example navigation
            }
        } catch (err) {
            console.error("Submission Error:", err);
            setSubmitStatus({ type: 'error', message: err instanceof Error ? err.message : 'An unexpected error occurred during submission.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Render Logic ---

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    // Show error if loading failed or no lessonId
    if (error && !lessonState) {
        return (
            <Container>
                <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
            </Container>
        );
    }

    // Should not happen if logic is correct, but good fallback
    if (!lessonState) {
        return (
            <Container>
                <Typography sx={{ mt: 2 }}>Lesson data could not be loaded.</Typography>
            </Container>
        );
    }


    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Container maxWidth="sm">
                <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>
                    Edit Lesson {lessonId ? `(ID: ${lessonId})` : ''}
                </Typography>

                {/* Display general validation errors */}
                {error && !isSubmitting && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}
                {/* Display submission status */}
                {submitStatus && <Alert severity={submitStatus.type} sx={{ mb: 2 }}>{submitStatus.message}</Alert>}


                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    <Stack spacing={3}> {/* Use Stack for consistent spacing */}
                        {/* Subject */}
                        <Typography variant={"h3"}>
                            {lessonState.subject}
                        </Typography>

                        {/* Day Selection */}
                        <FormControl fullWidth required disabled={isSubmitting}>
                            <InputLabel id="day-select-label">Day</InputLabel>
                            <Select
                                labelId="day-select-label"
                                id="day-select"
                                value={lessonState.day}
                                label="Day"
                                onChange={handleDayChange}
                            >
                                {daysOfWeek.map((dayName) => (
                                    <MenuItem key={dayName} value={dayName}>
                                        {dayName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Time Pickers */}
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TimePicker
                                label="Start Time"
                                value={lessonState.tStart}
                                onChange={(newValue) => handleTimeChange('tStart', newValue)}
                                ampm={false} // Use 24-hour format consistent with 'HH:mm'
                                disabled={isSubmitting}
                                // renderInput={(params) => <TextField {...params} required fullWidth />} // Older syntax if needed
                                sx={{ flexGrow: 1 }}

                            />
                            <TimePicker
                                label="End Time"
                                value={lessonState.tEnd}
                                onChange={(newValue) => handleTimeChange('tEnd', newValue)}
                                ampm={false}
                                minTime={lessonState.tStart ?? undefined} // Prevent end time before start time
                                disabled={isSubmitting || !lessonState.tStart} // Disable if start time isn't set
                                // renderInput={(params) => <TextField {...params} required fullWidth />} // Older syntax if needed
                                sx={{ flexGrow: 1 }}
                            />
                        </Stack>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={isSubmitting || !lessonState.tStart || !lessonState.tEnd || !lessonState.day || !lessonState.subject} // Disable if submitting or invalid
                        >
                            {isSubmitting ? <CircularProgress size={24} /> : 'Save Changes'}
                        </Button>
                    </Stack>
                </Box>
            </Container>
        </LocalizationProvider>
    );
};

export default LessonEditPage;