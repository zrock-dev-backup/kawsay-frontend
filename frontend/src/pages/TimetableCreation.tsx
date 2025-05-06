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
    Alert,
    CircularProgress,
    FormControlLabel,
    Checkbox,
    FormGroup,
    FormLabel,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import type { CreateTimetableRequest, TimetableStructure } from '../interfaces/apiDataTypes';
import { createTimetable } from '../services/apiService';
dayjs.extend(customParseFormat);
interface TimeRangeUI {
    id: number;
    start: Dayjs | null;
    end: Dayjs | null;
}
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TimetableCreationPage: React.FC = () => {
    const [timetableName, setTimetableName] = useState<string>('');
    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    const [timeRanges, setTimeRanges] = useState<TimeRangeUI[]>([]);
    const [nextId, setNextId] = useState<number>(1);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTimetableName(event.target.value);
        setSubmitStatus(null);
    };
    const handleDayChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const dayName = event.target.name;
        setSelectedDays(prevSelectedDays => {
            if (event.target.checked) {
                return [...prevSelectedDays, dayName];
            } else {
                return prevSelectedDays.filter(day => day !== dayName);
            }
        });
        setSubmitStatus(null);
    };
    const handleAddRange = () => {
        const newRange: TimeRangeUI = {
            id: nextId,
            start: null,
            end: null,
        };
        setTimeRanges((prevRanges) => [...prevRanges, newRange]);
        setNextId((prevId) => prevId + 1);
        setSubmitStatus(null);
    };
    const handleRemoveRange = (idToRemove: number) => {
        setTimeRanges((prevRanges) =>
            prevRanges.filter((range) => range.id !== idToRemove)
        );
        setSubmitStatus(null);
    };
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
        setSubmitStatus(null);
    };
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setSubmitStatus(null);
        if (!timetableName || selectedDays.length === 0 || timeRanges.length === 0) {
            setSubmitStatus({ type: 'error', message: 'Please provide a name, select at least one day, and add at least one time range.' });
            return;
        }
        const invalidRange = timeRanges.find(r => !r.start || !r.end || r.end.isBefore(r.start));
        if (invalidRange) {
            setSubmitStatus({ type: 'error', message: `Invalid time range found. End time must be after start time, and both must be set.` });
            return;
        }
        setIsSubmitting(true);
        const apiPayload: CreateTimetableRequest = {
            name: timetableName,
            days: selectedDays,
            periods: timeRanges.map(range => ({
                start: range.start!.format('HH:mm'),
                end: range.end!.format('HH:mm'),
            })),
        };
        try {
            console.log('Submitting timetable creation:', apiPayload);
            const result: TimetableStructure = await createTimetable(apiPayload);
            console.log('Timetable creation successful:', result);
            setSubmitStatus({ type: 'success', message: `Timetable "${result.name}" created successfully! (ID: ${result.id})` });
            setTimetableName('');
            setSelectedDays([]);
            setTimeRanges([]);
            setNextId(1);
        } catch (err) {
            console.error('Error creating timetable:', err);
            setSubmitStatus({ type: 'error', message: err instanceof Error ? err.message : 'Failed to create timetable.' });
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Container maxWidth="md">
                <Typography variant="h4" gutterBottom>
                    Create New Timetable
                </Typography>
                {/* Status Alert */}
                {submitStatus && (
                    <Alert severity={submitStatus.type} sx={{ mt: 2, mb: 2 }}>
                        {submitStatus.message}
                    </Alert>
                )}
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
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
                    {/* Day Selection */}
                    <FormLabel component="legend" sx={{ mb: 1 }}>Select Days *</FormLabel>
                    <FormGroup row sx={{ mb: 3 }}>
                        {daysOfWeek.map(dayName => (
                            <FormControlLabel
                                key={dayName}
                                control={
                                    <Checkbox
                                        checked={selectedDays.includes(dayName)}
                                        onChange={handleDayChange}
                                        name={dayName}
                                        disabled={isSubmitting}
                                    />
                                }
                                label={dayName}
                            />
                        ))}
                    </FormGroup>
                    <Typography variant="h6" gutterBottom>
                        Time Periods *
                    </Typography>
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
                                    ampm={false}
                                    disabled={isSubmitting}
                                    sx={{ flexGrow: 1 }}
                                    slotProps={{ textField: { required: true } }}
                                />
                                <Typography sx={{ mx: 1 }}>to</Typography>
                                <TimePicker
                                    label="End Time"
                                    value={range.end}
                                    onChange={(newValue) =>
                                        handleTimeChange(range.id, 'end', newValue)
                                    }
                                    ampm={false}
                                    sx={{ flexGrow: 1 }}
                                    minTime={range.start ?? undefined}
                                    disabled={isSubmitting || !range.start}
                                     slotProps={{ textField: { required: true } }}
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
                            <Typography color="text.secondary">Add at least one time period.</Typography>
                        )}
                    </Stack>
                    <Button
                        variant="outlined"
                        startIcon={<AddCircleOutlineIcon />}
                        onClick={handleAddRange}
                        sx={{ mb: 3 }}
                        disabled={isSubmitting}
                    >
                        Add Time Period
                    </Button>
                    {/* Create Button */}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        // Disable if name is empty, no days selected, no time ranges, or submitting
                        disabled={!timetableName || selectedDays.length === 0 || timeRanges.length === 0 || isSubmitting}
                    >
                        {isSubmitting ? <CircularProgress size={24} /> : 'Create Timetable'}
                    </Button>
                </Box>
            </Container>
        </LocalizationProvider>
    );
};
export default TimetableCreationPage;
