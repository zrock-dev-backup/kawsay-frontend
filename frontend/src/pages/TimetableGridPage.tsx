// src/pages/TimetableGridPage.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    Chip,
    Stack,
    Button,
    Divider, // Added for visual separation
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'; // Icon for Generate Schedule
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

// Import necessary types and services
import type { TimetableStructure, TimetableDay, TimetablePeriod, Class as ApiClass, ClassOccurrence } from '../interfaces/apiDataTypes';
// Import the new service function
import { fetchTimetableStructureById, fetchClassesForTimetable, generateScheduleForTimetable } from '../services/apiService';
import ClassDetailsModal from '../components/ClassDetailsModal';

dayjs.extend(customParseFormat);

// Interfaces remain the same
interface GridCellContent {
    classId: number;
    occurrenceId: number;
    courseName: string;
    teacherName: string | null;
    length: number;
}
type ProcessedScheduleMap = {
    [dayId: number]: {
        [startPeriodId: number]: GridCellContent[];
    };
};

const TimetableGridPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // --- State ---
    const [timetableStructure, setTimetableStructure] = useState<TimetableStructure | null>(null);
    const [classes, setClasses] = useState<ApiClass[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
    // State for triggering data refresh after generation
    const [refreshKey, setRefreshKey] = useState<number>(0);
    // State for schedule generation process
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [generateStatus, setGenerateStatus] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null); // Added 'warning' type

    // --- Data Fetching ---
    useEffect(() => {
        if (!id) {
            setError('No Timetable ID provided in URL.');
            setLoading(false);
            return;
        }

        const loadData = async () => {
            setLoading(true);
            setError(null);
            // Don't clear structure/classes here initially, allows showing old data while reloading
            // setTimetableStructure(null);
            // setClasses([]);
            try {
                console.log(`Fetching data for timetable ID: ${id}, refreshKey: ${refreshKey}`);
                // Fetch structure and classes in parallel
                const [structureData, classesData] = await Promise.all([
                    fetchTimetableStructureById(id),
                    fetchClassesForTimetable(id)
                ]);
                console.log('Timetable data fetched:', { structureData, classesData });
                setTimetableStructure(structureData);
                setClasses(classesData);
            } catch (err) {
                console.error(`Error fetching data for timetable ID ${id}:`, err);
                setError(err instanceof Error ? err.message : 'Failed to load timetable data.');
                setTimetableStructure(null); // Clear structure on error
                setClasses([]); // Clear classes on error
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id, refreshKey]); // Add refreshKey dependency

    // --- Derived Data (Memoized) ---
    // (useMemo for scheduleMap, uniqueDays, uniquePeriods remains the same)
    const { scheduleMap, uniqueDays, uniquePeriods } = useMemo(() => {
        const map: ProcessedScheduleMap = {};
        let days: TimetableDay[] = [];
        let periods: TimetablePeriod[] = [];

        if (timetableStructure) {
            const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            days = [...timetableStructure.days].sort((a, b) => dayOrder.indexOf(a.name) - dayOrder.indexOf(b.name));
            periods = [...timetableStructure.periods].sort((a, b) => dayjs(a.start, 'HH:mm').diff(dayjs(b.start, 'HH:mm')));

            classes.forEach(cls => {
                 // Only include occurrences if the class has been scheduled (has occurrences)
                 if (cls.occurrences && cls.occurrences.length > 0) {
                     cls.occurrences.forEach(occ => {
                         if (!map[occ.dayId]) {
                             map[occ.dayId] = {};
                         }
                         if (!map[occ.dayId][occ.startPeriodId]) {
                             map[occ.dayId][occ.startPeriodId] = [];
                         }
                         map[occ.dayId][occ.startPeriodId].push({
                             classId: cls.id,
                             occurrenceId: occ.id ?? 0,
                             courseName: cls.course.name,
                             teacherName: cls.teacher?.name ?? null,
                             length: occ.length,
                         });
                     });
                 }
            });
        }
        return { scheduleMap: map, uniqueDays: days, uniquePeriods: periods };
    }, [timetableStructure, classes]);


    // --- Event Handlers ---
    // (handleLessonClick, handleCloseModal remain the same)
     const handleLessonClick = (classId: number) => {
        console.log(`Clicked Class ID: ${classId}. Opening details modal.`);
        setSelectedClassId(classId);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedClassId(null);
    };

    // (handleCreateClassClick remains the same)
     const handleCreateClassClick = () => {
        if (id) {
            console.log(`Navigating to class creation for timetable ID: ${id}`);
            navigate(`/table/${id}/create-class`);
        }
    };


    // Handler for the "Generate Schedule" button
    const handleGenerateScheduleClick = async () => {
        if (!id) return;

        setIsGenerating(true);
        setGenerateStatus(null); // Clear previous status
        setError(null); // Clear general fetch error

        try {
            console.log(`Triggering schedule generation for timetable ID: ${id}`);
            const result = await generateScheduleForTimetable(id);
            console.log('Schedule generation response:', result);

            // Backend returns a message object on both success (200 OK) and conflict (409)
            // Determine status type based on the message content (could be refined)
            let statusType: 'success' | 'warning' = 'success';
             if (result?.message?.toLowerCase().includes('failed') || result?.message?.toLowerCase().includes('conflict')) {
                 statusType = 'warning'; // Treat failure/conflict as a warning, as *some* schedule might still exist
             }

            setGenerateStatus({ type: statusType, message: result?.message || "Schedule generation process finished." });

            // Trigger a refresh of the grid data regardless of success/failure message
            // to show the latest state from the backend.
            setRefreshKey(prev => prev + 1);

        } catch (err) {
            console.error('Error during schedule generation request:', err);
            // Handle specific errors (like 404 Not Found if timetable disappeared)
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during schedule generation.';
            setGenerateStatus({ type: 'error', message: `Generation Error: ${errorMessage}` });
            setError(`Generation Error: ${errorMessage}`); // Also set general error maybe?
        } finally {
            setIsGenerating(false);
        }
    };


    // --- Render Logic ---

    if (loading && !timetableStructure) { // Show full loading only on initial load
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading timetable data...</Typography>
            </Box>
        );
    }

    if (error && !timetableStructure) { // Show error only if structure loading failed initially
        return (
            <Container maxWidth="lg">
                <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
                {/* Optional: Add retry button */}
            </Container>
        );
    }

    if (!timetableStructure) {
        return (
            <Container maxWidth="lg">
                <Typography sx={{ mt: 2 }}>Timetable structure could not be loaded.</Typography>
            </Container>
        );
    }

    // If structure is loaded but incomplete
    if (uniqueDays.length === 0 || uniquePeriods.length === 0) {
        return (
            <Container maxWidth="lg">
                <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', my: 3 }}>
                    Timetable: {timetableStructure.name} {id ? `(ID: ${id})` : ''}
                </Typography>
                <Alert severity="info" sx={{ mt: 2 }}>
                    This timetable structure is incomplete. It needs defined Days and Periods before classes can be scheduled or displayed.
                </Alert>
            </Container>
        );
    }

    // --- Main Grid Rendering ---
    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', my: 3 }}>
                Timetable: {timetableStructure.name} {id ? `(ID: ${id})` : ''}
                 {loading && <CircularProgress size={20} sx={{ ml: 1 }} />} {/* Show small spinner during refresh */}
            </Typography>

             {/* Display Generation Status */}
             {generateStatus && (
                 <Alert severity={generateStatus.type} sx={{ mt: 2, mb: 2 }} onClose={() => setGenerateStatus(null)}> {/* Allow dismissing */}
                     {generateStatus.message}
                 </Alert>
             )}
             {/* Display general fetch error if it occurs after initial load */}
              {error && timetableStructure && (
                 <Alert severity="error" sx={{ mt: 2, mb: 2 }} onClose={() => setError(null)}>
                     Error loading data: {error}
                 </Alert>
              )}


            {/* Action Buttons */}
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                 <Button
                     variant="outlined"
                     startIcon={isGenerating ? <CircularProgress size={20}/> : <AutoAwesomeIcon />}
                     onClick={handleGenerateScheduleClick}
                     disabled={isGenerating || loading} // Disable while loading grid or generating
                 >
                     {isGenerating ? 'Generating...' : 'Generate Schedule'}
                 </Button>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateClassClick}
                    disabled={isGenerating || loading} // Disable while loading or generating
                >
                    Add Class Manually
                </Button>
            </Box>
            <Divider sx={{ mb: 2 }}/>

             {/* Display message if no classes exist */}
             {classes.length === 0 && !loading && (
                 <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
                     No classes defined for this timetable. Add classes manually or use "Generate Schedule" if requirements are set.
                 </Alert>
             )}

            {/* Render the table only if there are periods and days */}
            {(uniquePeriods.length > 0 && uniqueDays.length > 0) && (
                <TableContainer component={Paper} elevation={3} sx={{ overflowX: 'auto' }}>
                    <Table sx={{ minWidth: 700 }} aria-label={`Timetable ${id}`}>
                        <TableHead sx={{ backgroundColor: 'grey.200' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', width: '120px', minWidth: '120px', position: 'sticky', left: 0, zIndex: 2, backgroundColor: 'grey.200' }}>Time</TableCell>
                                {uniqueDays.map((day) => (
                                    <TableCell key={day.id} align="center" sx={{ fontWeight: 'bold', minWidth: '150px' }}>{day.name}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {uniquePeriods.map((period) => (
                                <TableRow key={period.id} hover>
                                    <TableCell
                                        component="th"
                                        scope="row"
                                        sx={{
                                            fontWeight: 'medium',
                                            verticalAlign: 'top',
                                            position: 'sticky',
                                            left: 0,
                                            zIndex: 1,
                                            backgroundColor: 'background.paper',
                                            borderRight: '1px solid rgba(224, 224, 224, 1)',
                                            width: '120px',
                                            minWidth: '120px'
                                        }}
                                    >
                                        {`${period.start} - ${period.end}`}
                                    </TableCell>
                                    {uniqueDays.map((day) => {
                                        const occurrencesInCell: GridCellContent[] = scheduleMap[day.id]?.[period.id] || [];
                                        return (
                                            <TableCell
                                                key={`${day.id}-${period.id}`}
                                                align="center"
                                                sx={{
                                                    verticalAlign: 'top',
                                                    border: '1px solid rgba(224, 224, 224, 1)',
                                                    p: 0.5,
                                                    minWidth: '150px',
                                                    height: '60px',
                                                }}
                                            >
                                                {/* Render only if occurrences exist */}
                                                {occurrencesInCell.length > 0 && (
                                                    <Stack spacing={0.5} direction="column" alignItems="stretch">
                                                        {occurrencesInCell.map((content) => (
                                                            <Chip
                                                                key={`${content.classId}-${content.occurrenceId}`} // More unique key
                                                                label={
                                                                    <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'normal', textAlign: 'left' }}>
                                                                         <Typography variant="caption" display="block" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                                                                            {content.courseName}
                                                                         </Typography>
                                                                        {content.teacherName && (
                                                                             <Typography variant="caption" display="block" sx={{ lineHeight: 1.2 }}>
                                                                                {content.teacherName}
                                                                            </Typography>
                                                                         )}
                                                                          <Typography variant="caption" display="block" sx={{ lineHeight: 1.2, color: 'text.secondary' }}>
                                                                            ({content.length}p)
                                                                         </Typography>
                                                                     </Box>
                                                                }
                                                                onClick={() => handleLessonClick(content.classId)}
                                                                variant="outlined"
                                                                color="primary"
                                                                size="small"
                                                                sx={{
                                                                    cursor: 'pointer',
                                                                    width: '100%',
                                                                    height: 'auto',
                                                                    minHeight: '40px',
                                                                    '& .MuiChip-label': {
                                                                        overflow: 'hidden',
                                                                        display: 'block',
                                                                        paddingY: '4px',
                                                                    },
                                                                    mb: 0.5,
                                                                }}
                                                            />
                                                        ))}
                                                    </Stack>
                                                 )}
                                                 {/* Render empty box if no occurrences to maintain cell height */}
                                                 {occurrencesInCell.length === 0 && (
                                                     <Box sx={{ minHeight: '40px' }}></Box>
                                                 )}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )} {/* End conditional table rendering */}

            {/* Class Details Modal */}
            {timetableStructure && (
                 <ClassDetailsModal
                     classId={selectedClassId}
                     open={isModalOpen}
                     onClose={handleCloseModal}
                     timetableStructure={timetableStructure}
                 />
            )}

        </Container>
    );
};

export default TimetableGridPage;
