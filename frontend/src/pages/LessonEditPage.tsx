import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
    Container,
    Typography,
    TextField,
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
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { fetchLessonById, updateLesson } from '../services/apiService';
import type { LessonApiData, LessonEditState } from '../interfaces/apiDataTypes';

dayjs.extend(customParseFormat);

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const LessonEditPage: React.FC = () => {
    const { lessonId } = useParams<{ lessonId: string }>();

    const [lessonState, setLessonState] = useState<LessonEditState | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);


    useEffect(() => {
        if (!lessonId) {
            setError('No Lesson ID provided in URL.');
            setLoading(false);
            return;
        }

        const loadInitialData = async () => {
            setLoading(true);
            setError(null);
            setSubmitStatus(null);
            try {
                console.log(`Attempting to fetch lesson data for ID: ${lessonId}`);
                const apiData = await fetchLessonById(lessonId);
                console.log(`Lesson data received for ID ${lessonId}:`, apiData);

                const startTime = apiData.tStart ? dayjs(apiData.tStart, 'HH:mm') : null;
                const endTime = apiData.tEnd ? dayjs(apiData.tEnd, 'HH:mm') : null;

                if (apiData.tStart && !startTime?.isValid()) {
                    console.warn(`Invalid start time format received: ${apiData.tStart}`);
                }
                if (apiData.tEnd && !endTime?.isValid()) {
                    console.warn(`Invalid end time format received: ${apiData.tEnd}`);
                }

                setLessonState({
                    tStart: startTime?.isValid() ? startTime : null,
                    tEnd: endTime?.isValid() ? endTime : null,
                    day: apiData.day,
                    subject: apiData.subject,
                });
            } catch (err) {
                console.error(`Error fetching lesson for ID ${lessonId}:`, err);
                setError(err instanceof Error ? err.message : 'Failed to load lesson data.');
                setLessonState(null);
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, [lessonId]);


    const handleTimeChange = useCallback((field: 'tStart' | 'tEnd', newValue: Dayjs | null) => {
        setLessonState(prevState => prevState ? { ...prevState, [field]: newValue } : null);
        setSubmitStatus(null);
        setError(null);
    }, []);

    const handleDayChange = useCallback((event: SelectChangeEvent<string>) => {
        const newDay = event.target.value;
        setLessonState(prevState => prevState ? { ...prevState, day: newDay } : null);
        setSubmitStatus(null);
        setError(null);
    }, []);



    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!lessonState || !lessonId) return;

        setSubmitStatus(null);
        setError(null);

        if (!lessonState.tStart || !lessonState.tEnd || !lessonState.day || !lessonState.subject) {
            setError('All fields (Start Time, End Time, Day) are required.');
            return;
        }
        if (!lessonState.tStart.isValid() || !lessonState.tEnd.isValid()) {
            setError('Invalid time format entered.');
            return;
        }
        if (lessonState.tEnd.isBefore(lessonState.tStart)) {
            setError('End time cannot be before start time.');
            return;
        }

        setIsSubmitting(true);

        const apiPayload: LessonApiData = {
            tStart: lessonState.tStart.format('HH:mm'),
            tEnd: lessonState.tEnd.format('HH:mm'),
            day: lessonState.day,
            subject: lessonState.subject,
        };

        try {
            console.log(`Submitting update for lesson ID ${lessonId}:`, apiPayload);
            const result = await updateLesson(lessonId, apiPayload);
            console.log(`Lesson update successful for ID ${lessonId}:`, result);
            setSubmitStatus({ type: 'success', message: 'Lesson updated successfully!' });
        } catch (err) {
            console.error(`Submission Error for lesson ID ${lessonId}:`, err);
            setSubmitStatus({ type: 'error', message: err instanceof Error ? err.message : 'An unexpected error occurred during submission.' });
        } finally {
            setIsSubmitting(false);
        }
    };


    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading lesson data...</Typography>
            </Box>
        );
    }

    if (error && !lessonState && !isSubmitting) {
        return (
            <Container>
                <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
            </Container>
        );
    }

    if (!lessonState) {
        return (
            <Container>
                <Typography sx={{ mt: 2 }}>Lesson data could not be loaded or is unavailable.</Typography>
            </Container>
        );
    }


    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Container maxWidth="sm">
                <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>
                    Edit Lesson {lessonId ? `(ID: ${lessonId})` : ''}
                </Typography>

                
                {error && !isSubmitting && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}
                
                {submitStatus && <Alert severity={submitStatus.type} sx={{ mb: 2 }}>{submitStatus.message}</Alert>}


                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    <Stack spacing={3}> 
                        
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="subject"
                            label="Subject Name"
                            name="subject"
                            value={lessonState.subject}
                            disabled={isSubmitting}
                            InputProps={{
                                readOnly: true,
                            }}
                            sx={{ backgroundColor: 'action.disabledBackground' }}
                        />

                        
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

                        
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TimePicker
                                label="Start Time *"
                                value={lessonState.tStart}
                                onChange={(newValue) => handleTimeChange('tStart', newValue)}
                                ampm={false}
                                disabled={isSubmitting}
                                sx={{ flexGrow: 1 }}
                            />
                            <TimePicker
                                label="End Time *"
                                value={lessonState.tEnd}
                                onChange={(newValue) => handleTimeChange('tEnd', newValue)}
                                ampm={false}
                                minTime={lessonState.tStart ?? undefined}
                                disabled={isSubmitting || !lessonState.tStart}
                                sx={{ flexGrow: 1 }}
                            />
                        </Stack>

                        
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={isSubmitting || !lessonState.tStart || !lessonState.tEnd || !lessonState.day}
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