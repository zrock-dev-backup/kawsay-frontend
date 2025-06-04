import React, {useState, useEffect, useMemo} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
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
    Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ViewListIcon from '@mui/icons-material/ViewList';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import type {TimetableStructure, TimetableDay, TimetablePeriod, Class as ApiClass} from '../interfaces/apiDataTypes';
import {
    fetchTimetableStructureById,
    fetchClassesForTimetable,
    generateScheduleForTimetable
} from '../services/apiService';
import ClassDetailsModal from '../components/ClassDetailsModal';
import ClassListModal from '../components/ClassListModal';

dayjs.extend(customParseFormat);

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
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [timetableStructure, setTimetableStructure] = useState<TimetableStructure | null>(null);
    const [classes, setClasses] = useState<ApiClass[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
    const [isClassListModalOpen, setIsClassListModalOpen] = useState<boolean>(false);
    const [refreshKey, setRefreshKey] = useState<number>(0);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [generateStatus, setGenerateStatus] = useState<{
        type: 'success' | 'error' | 'warning';
        message: string
    } | null>(null);

    useEffect(() => {
        if (!id) {
            setError('No Timetable ID provided in URL.');
            setLoading(false);
            return;
        }
        const loadData = async () => {
            setLoading(true);
            setError(null);
            try {
                console.log(`Fetching data for timetable ID: ${id}, refreshKey: ${refreshKey}`);
                const [structureData, classesData] = await Promise.all([
                    fetchTimetableStructureById(id),
                    fetchClassesForTimetable(id)
                ]);
                console.log('Timetable data fetched:', {structureData, classesData});
                setTimetableStructure(structureData);
                setClasses(classesData);
            } catch (err) {
                console.error(`Error fetching data for timetable ID ${id}:`, err);
                setError(err instanceof Error ? err.message : 'Failed to load timetable data.');
                setTimetableStructure(null);
                setClasses([]);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id, refreshKey]);

    const {scheduleMap, uniqueDays, uniquePeriods} = useMemo(() => {
        const map: ProcessedScheduleMap = {};
        let days: TimetableDay[] = [];
        let periods: TimetablePeriod[] = [];
        if (timetableStructure) {
            const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            days = [...timetableStructure.days].sort((a, b) => dayOrder.indexOf(a.name) - dayOrder.indexOf(b.name));
            periods = [...timetableStructure.periods].sort((a, b) => dayjs(a.start, 'HH:mm').diff(dayjs(b.start, 'HH:mm')));
            classes.forEach(cls => {
                if (cls.classOccurrences && cls.length > 0) {
                    cls.classOccurrences.forEach(occ => {
                        if (!map[occ.dayId]) {
                            map[occ.dayId] = {};
                        }
                        if (!map[occ.dayId][occ.startPeriodId]) {
                            map[occ.dayId][occ.startPeriodId] = [];
                        }
                        map[occ.dayId][occ.startPeriodId].push({
                            classId: cls.id,
                            occurrenceId: occ.id ?? 0,
                            courseName: cls.courseDto.name,
                            teacherName: cls.teacherDto?.name ?? null,
                            length: cls.length,
                        });
                    });
                }
            });
        }
        return {scheduleMap: map, uniqueDays: days, uniquePeriods: periods};
    }, [timetableStructure, classes]);

    const handleLessonClick = (classId: number) => {
        console.log(`Clicked Class ID: ${classId}. Opening details modal.`);
        setSelectedClassId(classId);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedClassId(null);
    };

    const handleOpenClassListModal = () => {
        setIsClassListModalOpen(true);
    };

    const handleSelectClassFromList = (classId: number) => {
        setIsClassListModalOpen(false);
        handleLessonClick(classId);
    };

    const handleCreateClassClick = () => {
        if (id) {
            console.log(`Navigating to class creation for timetable ID: ${id}`);
            navigate(`/table/${id}/create-class`);
        }
    };

    const handleGenerateScheduleClick = async () => {
        if (!id) return;
        setIsGenerating(true);
        setGenerateStatus(null);
        setError(null);
        try {
            console.log(`Triggering schedule generation for timetable ID: ${id}`);
            const result = await generateScheduleForTimetable(id);
            console.log('Schedule generation response:', result);
            let statusType: 'success' | 'warning' = 'success';
            if (result?.message?.toLowerCase().includes('failed') || result?.message?.toLowerCase().includes('conflict')) {
                statusType = 'warning';
            }
            setGenerateStatus({type: statusType, message: result?.message || "Schedule generation process finished."});
            setRefreshKey(prev => prev + 1);
        } catch (err) {
            console.error('Error during schedule generation request:', err);
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during schedule generation.';
            setGenerateStatus({type: 'error', message: `Generation Error: ${errorMessage}`});
            setError(`Generation Error: ${errorMessage}`);
        } finally {
            setIsGenerating(false);
        }
    };

    if (loading && !timetableStructure) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', mt: 4}}>
                <CircularProgress/>
                <Typography sx={{ml: 2}}>Loading timetable data...</Typography>
            </Box>
        );
    }

    if (error && !timetableStructure) {
        return (
            <Container maxWidth="lg">
                <Alert severity="error" sx={{mt: 2}}>{error}</Alert>
            </Container>
        );
    }

    if (!timetableStructure) {
        return (
            <Container maxWidth="lg">
                <Typography sx={{mt: 2}}>Timetable structure could not be loaded.</Typography>
            </Container>
        );
    }
    
    // Display this message if structure is loaded but it's empty
    if (uniqueDays.length === 0 || uniquePeriods.length === 0) {
        return (
            <Container maxWidth="lg">
                <Typography variant="h4" gutterBottom sx={{textAlign: 'center', my: 3}}>
                    Timetable: {timetableStructure.name} {id ? `(ID: ${id})` : ''}
                </Typography>
                <Alert severity="info" sx={{mt: 2}}>
                    This timetable structure is incomplete. It needs defined Days and Periods before classes can be
                    scheduled or displayed.
                </Alert>
                 {/* Action Buttons even if structure is empty */}
                <Box sx={{my: 2, display: 'flex', justifyContent: 'flex-end', gap: 1}}>
                    <Button
                        variant="outlined"
                        startIcon={isGenerating ? <CircularProgress size={20}/> : <AutoAwesomeIcon/>}
                        onClick={handleGenerateScheduleClick}
                        disabled={isGenerating || loading}
                    >
                        {isGenerating ? 'Generating...' : 'Generate Schedule'}
                    </Button>
                     <Button
                        variant="outlined"
                        startIcon={<ViewListIcon />}
                        onClick={handleOpenClassListModal}
                        disabled={loading || classes.length === 0}
                    >
                        View Classes
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon/>}
                        onClick={handleCreateClassClick}
                        disabled={isGenerating || loading}
                    >
                        Add Class Manually
                    </Button>
                </Box>
                {timetableStructure && (
                    <ClassListModal
                        open={isClassListModalOpen}
                        onClose={() => setIsClassListModalOpen(false)}
                        classes={classes}
                        onClassSelect={handleSelectClassFromList}
                        timetableName={timetableStructure.name}
                    />
                )}
            </Container>
        );
    }

    // --- Main Grid Rendering ---
    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom sx={{textAlign: 'center', my: 3}}>
                Timetable: {timetableStructure.name} {id ? `(ID: ${id})` : ''}
                {loading && <CircularProgress size={20} sx={{ml: 1}}/>}
            </Typography>

            {/* Display Generation Status */}
            {generateStatus && (
                <Alert severity={generateStatus.type} sx={{mt: 2, mb: 2}}
                       onClose={() => setGenerateStatus(null)}> {/* Allow dismissing */}
                    {generateStatus.message}
                </Alert>
            )}

            {/* Display general error if structure is loaded but classes/etc failed */}
            {error && timetableStructure && (
                <Alert severity="error" sx={{mt: 2, mb: 2}} onClose={() => setError(null)}>
                    Error loading data: {error}
                </Alert>
            )}

            {/* Action Buttons */}
            <Box sx={{mb: 2, display: 'flex', justifyContent: 'flex-end', gap: 1}}>
                <Button
                    variant="outlined"
                    startIcon={isGenerating ? <CircularProgress size={20}/> : <AutoAwesomeIcon/>}
                    onClick={handleGenerateScheduleClick}
                    disabled={isGenerating || loading}
                >
                    {isGenerating ? 'Generating...' : 'Generate Schedule'}
                </Button>
                <Button
                    variant="outlined"
                    startIcon={<ViewListIcon />}
                    onClick={handleOpenClassListModal}
                    disabled={loading || classes.length === 0}
                >
                    View Classes
                </Button>
                <Button
                    variant="contained"
                    startIcon={<AddIcon/>}
                    onClick={handleCreateClassClick}
                    disabled={isGenerating || loading}
                >
                    Add Class Manually
                </Button>
            </Box>
            <Divider sx={{mb: 2}}/>

            {classes.length === 0 && !loading && (uniqueDays.length > 0 && uniquePeriods.length > 0) && (
                <Alert severity="info" sx={{mt: 2, mb: 2}}>
                    No classes defined for this timetable. Add classes manually or use "Generate Schedule" if
                    requirements are set.
                </Alert>
            )}

            {/* Render the table only if there are periods and days */}
            {(uniquePeriods.length > 0 && uniqueDays.length > 0) && (
                <TableContainer component={Paper} elevation={3} sx={{overflowX: 'auto'}}>
                    <Table sx={{minWidth: 700}} aria-label={`Timetable ${id}`}>
                        <TableHead sx={{backgroundColor: 'grey.200'}}>
                            <TableRow>
                                <TableCell sx={{
                                    fontWeight: 'bold',
                                    width: '120px',
                                    minWidth: '120px',
                                    position: 'sticky',
                                    left: 0,
                                    zIndex: 2,
                                    backgroundColor: 'grey.200'
                                }}>Time</TableCell>
                                {uniqueDays.map((day) => (
                                    <TableCell key={day.id} align="center"
                                               sx={{fontWeight: 'bold', minWidth: '150px'}}>{day.name}</TableCell>
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
                                                {occurrencesInCell.length > 0 && (
                                                    <Stack spacing={0.5} direction="column" alignItems="stretch">
                                                        {occurrencesInCell.map((content) => (
                                                            <Chip
                                                                key={`${content.classId}-${content.occurrenceId}`}
                                                                label={
                                                                    <Box sx={{
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis',
                                                                        whiteSpace: 'normal',
                                                                        textAlign: 'left'
                                                                    }}>
                                                                        <Typography variant="caption" display="block"
                                                                                    sx={{
                                                                                        fontWeight: 'bold',
                                                                                        lineHeight: 1.2
                                                                                    }}>
                                                                            {content.courseName}
                                                                        </Typography>
                                                                        {content.teacherName && (
                                                                            <Typography variant="caption"
                                                                                        display="block"
                                                                                        sx={{lineHeight: 1.2}}>
                                                                                {content.teacherName}
                                                                            </Typography>
                                                                        )}
                                                                        <Typography variant="caption" display="block"
                                                                                    sx={{
                                                                                        lineHeight: 1.2,
                                                                                        color: 'text.secondary'
                                                                                    }}>
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
                                                {/* Placeholder Box if no occurrences, to maintain cell height */}
                                                {occurrencesInCell.length === 0 && (
                                                    <Box sx={{minHeight: '40px'}}></Box>
                                                )}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Class Details Modal */}
            {timetableStructure && (
                <ClassDetailsModal
                    classId={selectedClassId}
                    open={isModalOpen}
                    onClose={handleCloseModal}
                    timetableStructure={timetableStructure}
                />
            )}

            {/* Render the Class List Modal */}
            {timetableStructure && (
                <ClassListModal
                    open={isClassListModalOpen}
                    onClose={() => setIsClassListModalOpen(false)}
                    classes={classes}
                    onClassSelect={handleSelectClassFromList}
                    timetableName={timetableStructure.name}
                />
            )}
        </Container>
    );
};

export default TimetableGridPage;
