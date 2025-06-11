import React from 'react';
import {Alert, Box, Button, Divider, List, ListItem, ListItemText, Paper, Typography} from '@mui/material';
import Grid from '@mui/material/Grid';
import {StudentCohortDto} from '../../interfaces/apiDataTypes';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ReplayIcon from '@mui/icons-material/Replay';

interface CohortDisplayProps {
    cohorts: StudentCohortDto | null;
    isLoading: boolean;
    isProcessing: boolean;
    onBulkAdvance: () => void;
    onBulkRetake: () => void;
}

const CohortDisplay: React.FC<CohortDisplayProps> = ({
                                                         cohorts,
                                                         isLoading,
                                                         isProcessing,
                                                         onBulkAdvance,
                                                         onBulkRetake
                                                     }) => {
    if (isLoading) {
        return <Typography>Loading cohorts...</Typography>;
    }

    if (!cohorts) {
        return <Alert severity="info">Cohorts will be displayed here after grades are ingested.</Alert>;
    }

    const hasAdvancing = cohorts.advancingStudents.length > 0;
    const hasRetake = cohorts.retakeStudents.length > 0;

    return (
        <Grid container spacing={3}>
            {/* Advancing Students Column */}
            <Grid size={{xs: 12, md: 6}}>
                <Paper elevation={1} sx={{p: 2, display: 'flex', flexDirection: 'column', height: '100%'}}>
                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Typography variant="h6" gutterBottom>
                            Advancing Students ({cohorts.advancingStudents.length})
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            startIcon={<ArrowForwardIcon/>}
                            onClick={onBulkAdvance}
                            disabled={!hasAdvancing || isProcessing}
                        >
                            Advance Cohort
                        </Button>
                    </Box>
                    <Divider sx={{mb: 1}}/>
                    <Box sx={{flexGrow: 1, overflowY: 'auto'}}>
                        {hasAdvancing ? (
                            <List dense>
                                {cohorts.advancingStudents.map((student) => (
                                    <ListItem key={student.id}>
                                        <ListItemText primary={student.name} secondary={`ID: ${student.id}`}/>
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Typography variant="body2" color="text.secondary" sx={{p: 1}}>
                                No students in this cohort.
                            </Typography>
                        )}
                    </Box>
                </Paper>
            </Grid>

            {/* Retake Students Column */}
            <Grid size={{xs: 12, md: 6}}>
                <Paper elevation={1} sx={{p: 2, display: 'flex', flexDirection: 'column', height: '100%'}}>
                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Typography variant="h6" gutterBottom>
                            Students Requiring Retake ({cohorts.retakeStudents.length})
                        </Typography>
                        <Button
                            variant="outlined"
                            color="secondary"
                            size="small"
                            startIcon={<ReplayIcon/>}
                            onClick={onBulkRetake}
                            disabled={!hasRetake || isProcessing}
                        >
                            Process Retakes
                        </Button>
                    </Box>
                    <Divider sx={{mb: 1}}/>
                    <Box sx={{flexGrow: 1, overflowY: 'auto'}}>
                        {hasRetake ? (
                            <List dense>
                                {cohorts.retakeStudents.map((student) => (
                                    <ListItem key={student.id}>
                                        <ListItemText primary={student.name} secondary={`ID: ${student.id}`}/>
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Typography variant="body2" color="text.secondary" sx={{p: 1}}>
                                No students in this cohort.
                            </Typography>
                        )}
                    </Box>
                </Paper>
            </Grid>
        </Grid>
    );
};

export default CohortDisplay;

