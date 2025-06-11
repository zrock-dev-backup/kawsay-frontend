import React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Skeleton } from '@mui/material';
import { useClassCreationForm } from '../hooks/lecture/useClassCreationForm';
import { useClassFormData } from '../hooks/lecture/useClassFormData'; // Fetches courses, teachers, timetable
import { useAcademicStructure } from '../hooks/useAcademicStructure'; // Fetches cohorts
import ClassCreationForm from '../components/lecture/ClassCreationForm';

const ClassCreationPage: React.FC = () => {
    const { timetableId } = useParams<{ timetableId: string }>();

    // Centralize data fetching here in the page component
    const { timetableStructure, courses, teachers, sortedPeriods, loading: loadingFormData, fetchError: fetchErrorFormData } = useClassFormData(timetableId);
    const { cohorts, loading: loadingCohorts, error: errorCohorts } = useAcademicStructure(timetableId);

    const formState = useClassCreationForm(timetableId);
    const isLoading = loadingFormData || loadingCohorts;
    const fetchError = fetchErrorFormData || errorCohorts;

    if (isLoading) {
        return (
            <Container maxWidth="md">
                <Typography variant="h4" gutterBottom>
                    <Skeleton variant="text" width="70%" />
                </Typography>
                <Skeleton variant="rectangular" height={56} sx={{ mt: 2 }} />
                <Skeleton variant="rectangular" height={56} sx={{ mt: 2 }} />
                <Skeleton variant="rectangular" height={300} sx={{ mt: 3 }} />
                <Skeleton variant="rectangular" height={56} sx={{ mt: 3 }} />
            </Container>
        );
    }
    
    if (fetchError && !timetableStructure) {
        return (
            <Container maxWidth="md">
                <Typography variant="h4" gutterBottom color="error">
                    Error Loading Page Data
                </Typography>
                <Typography sx={{ mt: 2 }}>
                    Could not load essential data for timetable ID: {timetableId}. Details: {fetchError}
                </Typography>
            </Container>
        );
    }
    
    return <ClassCreationForm
        {...formState}
        timetableStructure={timetableStructure}
        courses={courses}
        teachers={teachers}
        cohorts={cohorts}
        sortedPeriods={sortedPeriods}
        fetchError={fetchError}
    />;
};

export default ClassCreationPage;
