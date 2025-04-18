import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate} from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Paper,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    CircularProgress,
    Alert,
    Chip, // Use Chip for visually distinct lessons
    Stack, // Use Stack to group multiple lessons in one cell
} from '@mui/material';
import type { TimetableData, Lesson } from '../interfaces/Timetable'; // Import interfaces

// --- Mock API Function ---
// Replace with your actual API call logic
const fetchTimetableDataById = async (id: string): Promise<TimetableData> => {
    console.log(`Fetching timetable data for ID: ${id}...`);
    await new Promise((resolve) => setTimeout(resolve, 1200)); // Simulate delay

    // Example data matching the requested structure
    const mockData: TimetableData = {
        title: `Timetable for ID ${id}`, // Dynamic title based on ID
        timeslots: [
            { id: 1, start: '08:00', end: '09:30' },
            { id: 2, start: '09:45', end: '11:15' },
            { id: 3, start: '11:30', end: '13:00' },
            // Add more timeslots as needed
        ],
        days: [
            { id: 1, name: 'Monday' },
            { id: 2, name: 'Tuesday' },
            { id: 3, name: 'Wednesday' },
            { id: 4, name: 'Thursday' },
            { id: 5, name: 'Friday' },
        ],
        lessons: [
            // Example lessons - adjust based on the ID if needed for mock
            { timeslotId: 1, dayId: 1, name: 'Mathematics' },
            { timeslotId: 1, dayId: 2, name: 'Physics' },
            { timeslotId: 2, dayId: 1, name: 'Literature' },
            { timeslotId: 1, dayId: 3, name: 'Chemistry' },
            { timeslotId: 3, dayId: 4, name: 'History' },
            { timeslotId: 2, dayId: 5, name: 'Physical Ed.' },
            // Example of multiple lessons in one slot
            { timeslotId: 1, dayId: 1, name: 'Advanced Math Topic' },
            { timeslotId: 3, dayId: 2, name: 'Biology Lab' },
            { timeslotId: 3, dayId: 2, name: 'Biology Lecture' },
        ],
    };

    // Simulate potential error
    // if (id === 'error') {
    //   throw new Error('Failed to load timetable data.');
    // }

    console.log('Timetable data fetched.');
    return mockData;
};
// --- End Mock API Function ---

// Helper type for the processed lessons map
type LessonsMap = {
    [dayId: number]: {
        [timeslotId: number]: Lesson[]; // Store an array of lessons
    };
};

const TimetableGridPage: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // Get ID from URL
    const [timetableData, setTimetableData] = useState<TimetableData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate()

    useEffect(() => {
        if (!id) {
            setError('No timetable ID provided.');
            setLoading(false);
            return;
        }

        const loadData = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await fetchTimetableDataById(id);
                setTimetableData(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id]); // Re-run effect if the ID changes

    // Pre-process lessons into a map for efficient lookup in the grid
    // useMemo ensures this calculation only runs when timetableData changes
    const lessonsMap: LessonsMap = useMemo(() => {
        const map: LessonsMap = {};
        if (!timetableData?.lessons) return map;

        for (const lesson of timetableData.lessons) {
            if (!map[lesson.dayId]) {
                map[lesson.dayId] = {};
            }
            if (!map[lesson.dayId][lesson.timeslotId]) {
                map[lesson.dayId][lesson.timeslotId] = [];
            }
            map[lesson.dayId][lesson.timeslotId].push(lesson);
        }
        return map;
    }, [timetableData?.lessons]); // Dependency: only recalculate if lessons change

    // Click handler for lessons (implement actual navigation or action later)
    const handleLessonClick = (lesson: Lesson) => {
        console.log('Clicked Lesson:', lesson);
        navigate(`/edit-lesson/1`); // If lessons have unique IDs
        // alert(`You clicked on: ${lesson.name}`);
    };

    // --- Render Logic ---
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container>
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            </Container>
        );
    }

    if (!timetableData) {
        // Should ideally be covered by loading/error, but good as a fallback
        return (
            <Container>
                <Typography sx={{ mt: 2 }}>No timetable data available.</Typography>
            </Container>
        );
    }

    // --- Render Timetable Grid ---
    return (
        <Container maxWidth="lg"> {/* Use a wider container */}
            <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', my: 3 }}>
                {timetableData.title}
            </Typography>

            <TableContainer component={Paper} elevation={3}>
                <Table sx={{ minWidth: 700 }} aria-label={`${timetableData.title} timetable`}>
                    {/* Table Header (Days) */}
                    <TableHead sx={{ backgroundColor: 'grey.200' }}>
                        <TableRow>
                            {/* Empty cell top-left */}
                            <TableCell sx={{ fontWeight: 'bold', width: '120px' }}>Time</TableCell>
                            {/* Day Headers */}
                            {timetableData.days.map((day) => (
                                <TableCell key={day.id} align="center" sx={{ fontWeight: 'bold' }}>
                                    {day.name}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>

                    {/* Table Body (Timeslots and Lessons) */}
                    <TableBody>
                        {timetableData.timeslots.map((timeslot) => (
                            <TableRow key={timeslot.id} hover>
                                {/* Timeslot Header Cell */}
                                <TableCell component="th" scope="row" sx={{ fontWeight: 'medium', verticalAlign: 'top' }}>
                                    {`${timeslot.start} - ${timeslot.end}`}
                                </TableCell>

                                {/* Lesson Cells for this Timeslot */}
                                {timetableData.days.map((day) => {
                                    // Find lessons for the current day and timeslot using the pre-processed map
                                    const cellLessons = lessonsMap[day.id]?.[timeslot.id] || []; // Default to empty array

                                    return (
                                        <TableCell key={`${day.id}-${timeslot.id}`} align="center" sx={{ verticalAlign: 'top', border: '1px solid rgba(224, 224, 224, 1)' }}>
                                            {cellLessons.length > 0 ? (
                                                <Stack spacing={1} direction="column" alignItems="stretch">
                                                    {cellLessons.map((lesson, index) => (
                                                        <Chip
                                                            key={index} // Use index as key if lessons don't have unique IDs within the cell
                                                            label={lesson.name}
                                                            onClick={() => handleLessonClick(lesson)}
                                                            variant="outlined" // Or "filled"
                                                            color="primary" // Or choose color based on lesson type?
                                                            size="small"
                                                            sx={{ cursor: 'pointer', width: '100%' }} // Make chip fill cell width
                                                        />
                                                    ))}
                                                </Stack>
                                            ) : (
                                                // Render empty cell or a placeholder like '-'
                                                null
                                            )}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default TimetableGridPage;