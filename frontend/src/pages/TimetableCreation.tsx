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
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import type { Dayjs } from 'dayjs';


interface TimeRange {
    id: number;
    start: Dayjs | null;
    end: Dayjs | null;
}

const TimetableCreation: React.FC = () => {
    const [timetableName, setTimetableName] = useState<string>('');
    const [timeRanges, setTimeRanges] = useState<TimeRange[]>([]);
    const [nextId, setNextId] = useState<number>(1);


    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTimetableName(event.target.value);
    };


    const handleAddRange = () => {
        const newRange: TimeRange = {
            id: nextId,
            start: null,
            end: null,
        };
        setTimeRanges((prevRanges) => [...prevRanges, newRange]);
        setNextId((prevId) => prevId + 1);
    };


    const handleRemoveRange = (idToRemove: number) => {
        setTimeRanges((prevRanges) =>
            prevRanges.filter((range) => range.id !== idToRemove)
        );
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
    };


    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        console.log('Timetable Name:', timetableName);
        console.log(
            'Time Ranges:',
            timeRanges.map((r) => ({
                start: r.start?.format('HH:mm'),
                end: r.end?.format('HH:mm'),
            }))
        );

        alert('Timetable data logged to console. See implementation notes.');
    };

    return (

        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Container maxWidth="md">
                <Typography variant="h4" gutterBottom>
                    Create New Timetable
                </Typography>

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
                    />

                    <Typography variant="h6" gutterBottom>
                        Time Ranges
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


                                    sx={{ flexGrow: 1 }}
                                />
                                <Typography sx={{ mx: 1 }}>to</Typography>
                                <TimePicker
                                    label="End Time"
                                    value={range.end}
                                    onChange={(newValue) =>
                                        handleTimeChange(range.id, 'end', newValue)
                                    }

                                    sx={{ flexGrow: 1 }}

                                    minTime={range.start ?? undefined}
                                />
                                <IconButton
                                    aria-label="delete time range"
                                    onClick={() => handleRemoveRange(range.id)}
                                    color="error"
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Paper>
                        ))}
                    </Stack>

                    <Button
                        variant="outlined"
                        startIcon={<AddCircleOutlineIcon />}
                        onClick={handleAddRange}
                        sx={{ mb: 3 }}
                    >
                        Add Time Range
                    </Button>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={!timetableName || timeRanges.length === 0}
                    >
                        Create Timetable
                    </Button>
                </Box>
            </Container>
        </LocalizationProvider>
    );
};

export default TimetableCreation;