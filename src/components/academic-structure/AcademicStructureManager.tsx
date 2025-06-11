import React, { useState } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useAcademicStructure } from '../../hooks/useAcademicStructure';
import CohortList from './CohortList';
import CreateCohortForm from './CreateCohortForm';

const AcademicStructureManager: React.FC = () => {
    const { id: timetableId } = useParams<{ id: string }>();
    const { cohorts, loading, error, addCohort } = useAcademicStructure(timetableId);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const handleCreateCohort = async (name: string) => {
        setIsSubmitting(true);
        setFormError(null);
        const newCohort = await addCohort(name);
        if (!newCohort) {
            setFormError("Failed to create the cohort.");
        }
        setIsSubmitting(false);
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    }

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom>Manage Cohorts</Typography>
            <Box sx={{ mb: 3 }}>
                <CreateCohortForm onSubmit={handleCreateCohort} isSubmitting={isSubmitting} />
                {formError && <Alert severity="error" sx={{ mt: 1 }}>{formError}</Alert>}
            </Box>
            
            {error && !loading && (
                <Alert severity="error">Error loading cohorts: {error}</Alert>
            )}

            {!error && <CohortList cohorts={cohorts} />}
        </Box>
    );
};

export default AcademicStructureManager;
