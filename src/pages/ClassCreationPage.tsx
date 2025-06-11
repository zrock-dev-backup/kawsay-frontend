import React from 'react';
import {useParams} from 'react-router-dom';
import {Alert, Box, Container, Skeleton, Typography} from '@mui/material';
import {useClassCreationForm} from '../hooks/lecture/useClassCreationForm';
import {useClassFormData} from '../hooks/lecture/useClassFormData';
import {useAcademicStructure} from '../hooks/useAcademicStructure';
import ClassCreationForm from '../components/lecture/ClassCreationForm';

const ClassCreationPage: React.FC = () => {
    const {timetableId} = useParams<{ timetableId: string }>();
    const {
        timetableStructure,
        courses,
        teachers,
        sortedPeriods,
        loading: loadingFormData,
        fetchError: fetchErrorFormData
    } = useClassFormData(timetableId);
    const {cohorts, loading: loadingCohorts, error: errorCohorts} = useAcademicStructure(timetableId);
    const formState = useClassCreationForm(timetableId);
    const isLoading = loadingFormData || loadingCohorts;
    const fetchError = [fetchErrorFormData, errorCohorts].filter(Boolean).join('; ');

    if (isLoading) {
        return (
            <Container maxWidth="md">
                <Typography variant="h4" gutterBottom>
                    <Skeleton variant="text" width="70%"/>
                </Typography>
                <Box sx={{mt: 2}}>
                    <Skeleton variant="rectangular" height={56}/>
                    <Skeleton variant="rectangular" height={56} sx={{mt: 2}}/>
                    <Skeleton variant="rectangular" height={56} sx={{mt: 2}}/>
                    <Skeleton variant="rectangular" height={300} sx={{mt: 3}}/>
                    <Skeleton variant="rectangular" height={56} sx={{mt: 3}}/>
                </Box>
            </Container>
        );
    }

    if (!timetableStructure) {
        return (
            <Container maxWidth="md">
                <Alert severity="error" sx={{mt: 2}}>
                    <Typography variant="h6">Failed to Load Timetable</Typography>
                    Could not load essential data for timetable ID: {timetableId}.
                    {fetchError && <Typography variant="body2" sx={{mt: 1}}>Details: {fetchError}</Typography>}
                </Alert>
            </Container>
        );
    }

    return (
        <ClassCreationForm
            {...formState}
            timetableStructure={timetableStructure}
            courses={courses}
            teachers={teachers}
            cohorts={cohorts}
            sortedPeriods={sortedPeriods}
            fetchError={fetchError}
        />
    );
};

export default ClassCreationPage;
