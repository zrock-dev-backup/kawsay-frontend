// src/pages/TimetableCreationPage.tsx
import React, { useState } from 'react';
import {
    Container,
    Typography,
    TextField,
    Button,
    Box,
    Stack,
    IconButton,
    Paper,
    Alert, // Import Alert
    CircularProgress, // Import CircularProgress
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { Dayjs } from 'dayjs'; // Import dayjs
import { createTimetable } from '../services/apiService'; // Import API function
import type { CreateTimetableRequest } from '../interfaces/apiDataTypes'; // Import interfaces

// Define the structure for a single time range in the UI state
interface TimeRangeUI {
    id: number; // Unique ID for React key and removal logic
    start: Dayjs | null;
    end: Dayjs | null;
}

const TimetableCreationPage: React.FC = () => {
    const [timetableName, setTimetableName] = useState<string>('');
    const [timeRanges, setTimeRanges] = useState<TimeRangeUI[]>([]);
    const [nextId, setNextId] = useState<number>(1); // Simple ID generator
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // Handler for timetable name change
    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTimetableName(event.target.value);
        setSubmitStatus(null); // Clear status on edit
    };

    // Handler to add a new empty time range row
    const handleAddRange = () => {
        const newRange: TimeRangeUI = {
            id: nextId,
            start: null,
            end: null,
        };
        setTimeRanges((prevRanges) => [...prevRanges, newRange]);
        setNextId((prevId) => prevId + 1);
        setSubmitStatus(null); // Clear status on edit
    };

    // Handler to remove a time range row by its ID
    const handleRemoveRange = (idToRemove: number) => {
        setTimeRanges((prevRanges) =>
            prevRanges.filter((range) => range.id !== idToRemove)
        );
        setSubmitStatus(null); // Clear status on edit
    };

    // Handler for time changes within a specific range row
    const handleTimeChange = (
        id: number,
        type: 'start' | 'end',
        newValue: Dayjs | null
    ) => {
        setTimeRanges((prevRanges) =>
            prevRanges.map((range) =>
                range.id === id ? { ...range, [type]: newValue } : range
            )
        );
        setSubmitStatus(null); // Clear status on edit
    };

    // Handler for form submission
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setSubmitStatus(null); // Clear previous status

        if (!timetableName || timeRanges.length === 0) {
            setSubmitStatus({ type: 'error', message: 'Please provide a name and at least one time range.' });
            return;
        }

        // Validate times within ranges
        const invalidRange = timeRanges.find(r => !r.start || !r.end || r.end.isBefore(r.start));
        if (invalidRange) {
            setSubmitStatus({ type: 'error', message: `Invalid time range found (ID: ${invalidRange.id}). End time must be after start time, and both must be set.` });
            return;
        }

        setIsSubmitting(true);

        // Prepare data for the API
        const apiPayload: CreateTimetableRequest = {
            title: timetableName,
            timeslots: timeRanges.map(range => ({
                // Non-null assertions are safe here due to validation above
                start: range.start!.format('HH:mm'),
                end: range.end!.format('HH:mm'),
            })),
        };

        try {
            console.log('Submitting timetable creation:', apiPayload);
            const result = await createTimetable(apiPayload);
            console.log('Timetable creation successful:', result);
            setSubmitStatus({ type: 'success', message: `${result.message} (New Track ID: ${result.trackId})` });
            // Optionally clear the form
            setTimetableName('');
            setTimeRanges([]);
            setNextId(1); // Reset ID counter if needed
        } catch (err) {
            console.error('Error creating timetable:', err);
            setSubmitStatus({ type: 'error', message: err instanceof Error ? err.message : 'Failed to create timetable.' });
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        // LocalizationProvider is required for @mui/x-date-pickers
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Container maxWidth="md">
                <Typography variant="h4" gutterBottom>
                    Create New Timetable
                </Typography>

                {/* Display submission status */}
                {submitStatus && (
                    <Alert severity={submitStatus.type} sx={{ mt: 2, mb: 2 }}>
                        {submitStatus.message}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    {/* Timetable Name Input */}
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="timetableName"
                        label="Timetable Name"
                        name="timetableName"
                        autoFocus
                        value={timetableName}
                        onChange={handleNameChange}
                        sx={{ mb: 3 }}
                        disabled={isSubmitting}
                    />

                    <Typography variant="h6" gutterBottom>
                        Time Ranges
                    </Typography>

                    {/* List of Time Range Inputs */}
                    <Stack spacing={2} sx={{ mb: 2 }}>
                        {timeRanges.map((range) => (
                            <Paper
                                key={range.id}
                                elevation={2}
                                sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}
                            >
                                <TimePicker
                                    label="Start Time"
                                    value={range.start}
                                    onChange={(newValue) =>
                                        handleTimeChange(range.id, 'start', newValue)
                                    }
                                    ampm={false} // Use 24hr format
                                    disabled={isSubmitting}
                                    sx={{ flexGrow: 1 }}
                                />
                                <Typography sx={{ mx: 1 }}>to</Typography>
                                <TimePicker
                                    label="End Time"
                                    value={range.end}
                                    onChange={(newValue) =>
                                        handleTimeChange(range.id, 'end', newValue)
                                    }
                                    ampm={false} // Use 24hr format
                                    sx={{ flexGrow: 1 }}
                                    minTime={range.start ?? undefined} // Basic validation
                                    disabled={isSubmitting || !range.start} // Disable if start not set
                                />
                                <IconButton
                                    aria-label="delete time range"
                                    onClick={() => handleRemoveRange(range.id)}
                                    color="error"
                                    disabled={isSubmitting}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Paper>
                        ))}
                        {timeRanges.length === 0 && !isSubmitting && (
                            <Typography color="text.secondary">Add at least one time range.</Typography>
                        )}
                    </Stack>

                    {/* Button to Add More Ranges */}
                    <Button
                        variant="outlined"
                        startIcon={<AddCircleOutlineIcon />}
                        onClick={handleAddRange}
                        sx={{ mb: 3 }}
                        disabled={isSubmitting}
                    >
                        Add Time Range
                    </Button>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={!timetableName || timeRanges.length === 0 || isSubmitting}
                    >
                        {isSubmitting ? <CircularProgress size={24} /> : 'Create Timetable'}
                    </Button>
                </Box>
            </Container>
        </LocalizationProvider>
    );
};

export default TimetableCreationPage;