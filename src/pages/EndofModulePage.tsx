import React from 'react';
import { Container, Typography, Box, Paper, Alert } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useEndofModule } from '../hooks/module-processing/useEndofModule';
import GradeIngestionForm from '../components/module-processing/GradeIngestionForm';
import CohortDisplay from '../components/module-processing/CohortDisplay';

const EndofModulePage: React.FC = () => {
    const { timetableId } = useParams<{ timetableId: string }>();
    const {
        csvData,
        onCsvDataChange,
        handleIngestGrades,
        isSubmitting,
        ingestionError,
        ingestionSuccess,
        cohorts,
        isLoadingCohorts,
    } = useEndofModule();

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" component="h1" gutterBottom>
                End-of-Module Processing
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
                Timetable ID: {timetableId || 'Not Specified'}
            </Typography>

            {ingestionSuccess && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {ingestionSuccess}
                </Alert>
            )}

            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Step 1: Ingest Grades
                </Typography>
                <GradeIngestionForm
                    csvData={csvData}
                    onCsvDataChange={onCsvDataChange}
                    onSubmit={handleIngestGrades}
                    isSubmitting={isSubmitting}
                    submitError={ingestionError}
                />
            </Paper>

            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Step 2: Review & Process Cohorts
                </Typography>
                <Box sx={{ mt: 2 }}>
                    <CohortDisplay cohorts={cohorts} isLoading={isLoadingCohorts} />
                </Box>
            </Paper>
        </Container>
    );
};

export default EndofModulePage;
