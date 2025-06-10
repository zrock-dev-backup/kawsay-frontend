import React from 'react';
import { Box, Typography, Grid, Paper, List, ListItem, ListItemText, Divider, Alert } from '@mui/material';
import { StudentCohortDto } from '../../interfaces/apiDataTypes';

interface CohortDisplayProps {
    cohorts: StudentCohortDto | null;
    isLoading: boolean;
}

const CohortDisplay: React.FC<CohortDisplayProps> = ({ cohorts, isLoading }) => {
    if (isLoading) {
        return <Typography>Loading cohorts...</Typography>;
    }

    if (!cohorts) {
        return <Alert severity="info">Cohorts will be displayed here after grades are ingested.</Alert>;
    }

    return (
        <Grid container spacing={3}>
            {/* Advancing Students Column */}
            <Grid item xs={12} md={6}>
                <Paper elevation={1} sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Advancing Students ({cohorts.advancingStudents.length})
                    </Typography>
                    <Divider sx={{ mb: 1 }} />
                    {cohorts.advancingStudents.length > 0 ? (
                        <List dense>
                            {cohorts.advancingStudents.map((student) => (
                                <ListItem key={student.id}>
                                    <ListItemText primary={student.name} secondary={`ID: ${student.id}`} />
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Typography variant="body2" color="text.secondary">No students in this cohort.</Typography>
                    )}
                </Paper>
            </Grid>

            {/* Retake Students Column */}
            <Grid item xs={12} md={6}>
                <Paper elevation={1} sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Students Requiring Retake ({cohorts.retakeStudents.length})
                    </Typography>
                    <Divider sx={{ mb: 1 }} />
                    {cohorts.retakeStudents.length > 0 ? (
                        <List dense>
                            {cohorts.retakeStudents.map((student) => (
                                <ListItem key={student.id}>
                                    <ListItemText primary={student.name} secondary={`ID: ${student.id}`} />
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Typography variant="body2" color="text.secondary">No students in this cohort.</Typography>
                    )}
                </Paper>
            </Grid>
        </Grid>
    );
};

export default CohortDisplay;
