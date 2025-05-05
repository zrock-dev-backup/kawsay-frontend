// src/components/ClassDetailsModal.tsx

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

// Import API types and service function
import type { Class, TimetableStructure, TimetablePeriod, TimetableDay } from '../interfaces/apiDataTypes';
import { fetchClassById, fetchTimetableStructureById } from '../services/apiService'; // Need timetable structure to display occurrence times/days

dayjs.extend(customParseFormat);

interface ClassDetailsModalProps {
    classId: number | null; // The ID of the class to display
    open: boolean; // Controls if the modal is open
    onClose: () => void; // Function to close the modal
    // We also need the timetable structure to map day/period IDs to names/times
    timetableStructure: TimetableStructure | null;
}

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '95%', sm: 500, md: 600 }, // Responsive width
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    maxHeight: '90vh', // Limit height
    overflowY: 'auto', // Add scroll if content overflows
};

const ClassDetailsModal: React.FC<ClassDetailsModalProps> = ({ classId, open, onClose, timetableStructure }) => {
    const [classData, setClassData] = useState<Class | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch class data when modal opens or classId changes
    useEffect(() => {
        if (!open || classId === null) {
            setClassData(null); // Clear previous data when closed or no ID
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

    }, [classId, open]); // Re-run effect if classId or open state changes

    // Helper to find day name by ID
    const getDayName = (dayId: number): string => {
        return timetableStructure?.days.find(day => day.id === dayId)?.name || `Unknown Day (ID: ${dayId})`;
    };

    // Helper to find period start/end times by ID
    const getPeriodTimes = (periodId: number): { start: string; end: string } | null => {
        return timetableStructure?.periods.find(period => period.id === periodId) || null;
    };

    // Helper to get the full time range string for an occurrence
    const getOccurrenceTimeRange = (occurrence: ClassOccurrence): string => {
        if (!timetableStructure) return 'Loading times...';

        const startPeriod = getPeriodTimes(occurrence.startPeriodId);
        if (!startPeriod) return `Invalid Start Period (ID: ${occurrence.startPeriodId})`;

        // Find the end period ID based on start period and length
        const startIndex = timetableStructure.periods.findIndex(p => p.id === occurrence.startPeriodId);
        if (startIndex === -1) return `Invalid Start Period (ID: ${occurrence.startPeriodId})`;

        const endPeriodIndex = startIndex + occurrence.length - 1;
        if (endPeriodIndex >= timetableStructure.periods.length) {
             // This indicates an occurrence length that goes beyond defined periods
             // We can show the start time and indicate it's invalid or spans beyond
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
                            <Typography variant="body1"><strong>Course:</strong> {classData.course.name} ({classData.course.code})</Typography>
                        </Grid>
                        <Grid item xs={12}>
                             <Typography variant="body1"><strong>Teacher:</strong> {classData.teacher ? `${classData.teacher.name} (${classData.teacher.type})` : 'Not Assigned'}</Typography>
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
