import React, { useState, useEffect } from 'react';
import {
    Modal,
    Box,
    Typography,
    CircularProgress,
    Alert,
    Divider,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Grid,
    Paper
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import type { Class, TimetableStructure, TimetablePeriod, TimetableDay } from '../interfaces/apiDataTypes';
import { fetchClassById, fetchTimetableStructureById } from '../services/apiService';
dayjs.extend(customParseFormat);
interface ClassDetailsModalProps {
    classId: number | null;
    open: boolean;
    onClose: () => void;
    timetableStructure: TimetableStructure | null;
}
const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '95%', sm: 500, md: 600 },
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    maxHeight: '90vh',
    overflowY: 'auto',
};
const ClassDetailsModal: React.FC<ClassDetailsModalProps> = ({ classId, open, onClose, timetableStructure }) => {
    const [classData, setClassData] = useState<Class | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        if (!open || classId === null) {
            setClassData(null);
            return;
        }
        const loadClassData = async () => {
            setLoading(true);
            setError(null);
            try {
                console.log(`Fetching details for class ID: ${classId}`);
                const data = await fetchClassById(classId);
                console.log(`Class data received for ID ${classId}:`, data);
                setClassData(data);
            } catch (err) {
                console.error(`Error fetching class details for ID ${classId}:`, err);
                setError(err instanceof Error ? err.message : 'Failed to load class details.');
                setClassData(null);
            } finally {
                setLoading(false);
            }
        };
        loadClassData();
    }, [classId, open]);
    const getDayName = (dayId: number): string => {
        return timetableStructure?.days.find(day => day.id === dayId)?.name || `Unknown Day (ID: ${dayId})`;
    };
    const getPeriodTimes = (periodId: number): { start: string; end: string } | null => {
        return timetableStructure?.periods.find(period => period.id === periodId) || null;
    };
    const getOccurrenceTimeRange = (occurrence: ClassOccurrence): string => {
        if (!timetableStructure) return 'Loading times...';
        const startPeriod = getPeriodTimes(occurrence.startPeriodId);
        if (!startPeriod) return `Invalid Start Period (ID: ${occurrence.startPeriodId})`;
        const startIndex = timetableStructure.periods.findIndex(p => p.id === occurrence.startPeriodId);
        if (startIndex === -1) return `Invalid Start Period (ID: ${occurrence.startPeriodId})`;
        const endPeriodIndex = startIndex + occurrence.length - 1;
        if (endPeriodIndex >= timetableStructure.periods.length) {
             return `${startPeriod.start} - Invalid End Time (Length: ${occurrence.length})`;
        }
        const endPeriod = timetableStructure.periods[endPeriodIndex];
        return `${startPeriod.start} - ${endPeriod.end}`;
    };
    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="class-details-modal-title"
            aria-describedby="class-details-modal-description"
        >
            <Box sx={style}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography id="class-details-modal-title" variant="h6" component="h2">
                        Class Details
                    </Typography>
                    <IconButton onClick={onClose} aria-label="close">
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Divider sx={{ mb: 2 }} />
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <CircularProgress />
                        <Typography sx={{ ml: 2 }}>Loading details...</Typography>
                    </Box>
                )}
                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
                )}
                {!loading && !error && classData && timetableStructure && (
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant="body1"><strong>Course:</strong> {classData.courseDto.name} ({classData.courseDto.code})</Typography>
                        </Grid>
                        <Grid item xs={12}>
                             <Typography variant="body1"><strong>Teacher:</strong> {classData.teacherDto ? `${classData.teacherDto.name} (${classData.teacherDto.type})` : 'Not Assigned'}</Typography>
                        </Grid>
                         <Grid item xs={12}>
                             <Typography variant="body1"><strong>Timetable ID:</strong> {classData.timetableId}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="h6" component="h3" sx={{ mt: 2, mb: 1 }}>Scheduled Occurrences:</Typography>
                            {classData.occurrences.length > 0 ? (
                                <List dense>
                                    {classData.occurrences.map((occurrence, index) => (
                                        <ListItem key={occurrence.id || index} disablePadding>
                                            <ListItemText
                                                primary={`${getDayName(occurrence.dayId)}: ${getOccurrenceTimeRange(occurrence)}`}
                                                secondary={`Length: ${occurrence.length} period${occurrence.length > 1 ? 's' : ''}`}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            ) : (
                                <Typography variant="body2" color="text.secondary">No occurrences scheduled for this class.</Typography>
                            )}
                        </Grid>
                    </Grid>
                )}
                 {!loading && !error && !classData && (
                     <Typography variant="body1" color="text.secondary">No class data available.</Typography>
                 )}
            </Box>
        </Modal>
    );
};
export default ClassDetailsModal;
