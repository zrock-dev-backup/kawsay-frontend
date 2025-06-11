import React from 'react';
import {Container, Typography, Box, Paper, Alert} from '@mui/material';
import {useParams} from 'react-router-dom';
import {useEndofModule} from '../hooks/module-processing/useEndofModule';
import GradeIngestionForm from '../components/module-processing/GradeIngestionForm';
import CohortDisplay from '../components/module-processing/CohortDisplay';
import ConfirmationDialog from '../components/common/ConfirmationDialog'; // Import the dialog

const EndofModulePage: React.FC = () => {
    const {timetableId} = useParams<{ timetableId: string }>();
    const {
        csvData,
        onCsvDataChange,
        handleIngestGrades,
        isSubmitting,
        ingestionError,
        ingestionSuccess,
        cohorts,
        isLoadingCohorts,
        handleBulkAdvance,
        handleBulkRetake,
        processingStatus,
        dialogConfig,
        isProcessing,
        closeDialog,
    } = useEndofModule();

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" component="h1" gutterBottom>
                End-of-Module Processing
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{mb: 3}}>
                Timetable ID: {timetableId || 'Not Specified'}
            </Typography>

            {ingestionSuccess && (
                <Alert severity="success" sx={{mb: 2}}>{ingestionSuccess}</Alert>
            )}
            {processingStatus && (
                <Alert severity={processingStatus.type} sx={{mb: 2}}>{processingStatus.message}</Alert>
            )}

            <Paper elevation={3} sx={{p: 3, mb: 4}}>
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

            <Paper elevation={3} sx={{p: 3}}>
                <Typography variant="h6" gutterBottom>
                    Step 2: Review & Process Cohorts
                </Typography>
                <Box sx={{mt: 2}}>
                    <CohortDisplay
                        cohorts={cohorts}
                        isLoading={isLoadingCohorts}
                        onBulkAdvance={handleBulkAdvance}
                        onBulkRetake={handleBulkRetake}
                        isProcessing={isProcessing}
                    />
                </Box>
            </Paper>

            <ConfirmationDialog
                open={dialogConfig?.open || false}
                title={dialogConfig?.title || ''}
                description={dialogConfig?.description || ''}
                onClose={closeDialog}
                onConfirm={dialogConfig?.onConfirm || (() => {
                })}
                isLoading={isProcessing}
            />
        </Container>
    );
};

export default EndofModulePage;
