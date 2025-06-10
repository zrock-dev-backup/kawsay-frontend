import React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Skeleton } from '@mui/material';
import { useClassCreationForm } from '../hooks/lecture/useClassCreationForm.ts';
import ClassCreationForm from '../components/lecture/ClassCreationForm.tsx';

const ClassCreationPage: React.FC = () => {
    const { timetableId } = useParams<{ timetableId: string }>();
    const formProps = useClassCreationForm(timetableId);

    if (formProps.loading && !formProps.timetableStructure) {
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

    if (formProps.fetchError && !formProps.timetableStructure) {
        return (
            <Container maxWidth="md">
                <Typography variant="h4" gutterBottom color="error">
                    Error Loading Page Data
                </Typography>
                <Typography sx={{ mt: 2 }}>
                    Could not load essential timetable data for ID: {timetableId}. Please check the ID and try again.
                </Typography>
            </Container>
        );
    }

    return <ClassCreationForm {...formProps} />;
};

export default ClassCreationPage;