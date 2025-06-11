import React, {useEffect, useState} from 'react';
import {Alert, Box, CircularProgress, Divider, Grid, IconButton, Modal, Typography,} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import type {Class, TimetableStructure} from '../interfaces/apiDataTypes';
import {fetchClassById} from '../services/apiService';

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
    width: {xs: '95%', sm: 500, md: 600},
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    maxHeight: '90vh',
    overflowY: 'auto',
};
const ClassDetailsModal: React.FC<ClassDetailsModalProps> = ({classId, open, onClose, timetableStructure}) => {
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

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="class-details-modal-title"
            aria-describedby="class-details-modal-description"
        >
            <Box sx={style}>
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                    <Typography id="class-details-modal-title" variant="h6" component="h2">
                        Class Details
                    </Typography>
                    <IconButton onClick={onClose} aria-label="close">
                        <CloseIcon/>
                    </IconButton>
                </Box>
                <Divider sx={{mb: 2}}/>
                {loading && (
                    <Box sx={{display: 'flex', justifyContent: 'center', mt: 2}}>
                        <CircularProgress/>
                        <Typography sx={{ml: 2}}>Loading details...</Typography>
                    </Box>
                )}
                {error && (
                    <Alert severity="error" sx={{mt: 2}}>{error}</Alert>
                )}
                {!loading && !error && classData && timetableStructure && (
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography
                                variant="body1"><strong>Course:</strong> {classData.courseDto.name} ({classData.courseDto.code})</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography
                                variant="body1"><strong>Teacher:</strong>
                                {classData.teacherDto ? `${classData.teacherDto.name} (${classData.teacherDto.type})` : 'Not Assigned'}
                            </Typography>
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
