import React, {useState} from 'react';
import {Alert, Box, CircularProgress, Typography} from '@mui/material';
import {useParams} from 'react-router-dom';
import {useAcademicStructure} from '../../hooks/useAcademicStructure';
import CohortList from './CohortList';
import CreateCohortForm from './CreateCohortForm';

const AcademicStructureManager: React.FC = () => {
    const {id: timetableId} = useParams<{ id: string }>();
    const {cohorts, loading, error, addCohort, addStudentGroup} = useAcademicStructure(timetableId);
    const [isSubmittingCohort, setIsSubmittingCohort] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const handleCreateCohort = async (name: string) => {
        setIsSubmittingCohort(true);
        setFormError(null);
        const newCohort = await addCohort(name);
        if (!newCohort) {
            setFormError("Failed to create the cohort. Please check the console for details.");
        }
        setIsSubmittingCohort(false);
    };

    const handleAddGroup = async (cohortId: number, groupName: string) => {
        await addStudentGroup(cohortId, groupName);
    };

    if (loading) {
        return <Box sx={{display: 'flex', justifyContent: 'center', p: 4}}><CircularProgress/></Box>;
    }

    return (
        <Box sx={{p: 2}}>
            <Typography variant="h5" gutterBottom>Manage Cohorts</Typography>
            <Box sx={{mb: 3}}>
                <CreateCohortForm onSubmit={handleCreateCohort} isSubmitting={isSubmittingCohort}/>
                {formError && <Alert severity="error" sx={{mt: 1}}>{formError}</Alert>}
            </Box>

            {error && !loading && (
                <Alert severity="error">An error occurred: {error}</Alert>
            )}

            {!error && <CohortList cohorts={cohorts} onAddGroup={handleAddGroup}/>}
        </Box>
    );
};

export default AcademicStructureManager;
