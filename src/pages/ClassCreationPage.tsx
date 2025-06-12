import React, {useState} from 'react';
import {Alert, Box, CircularProgress, Container, Typography} from '@mui/material';
import {useClassCreationWizard} from '../hooks/lecture/useClassCreationWizard.ts';
import {ClassTypeSelectionModal} from '../components/class-creation/ClassTypeSelectionModal.tsx';
import {ClassCreationWizard} from '../components/class-creation/ClassCreationWizard.tsx';
import type {ClassType} from '../interfaces/classDtos.ts';

const ClassCreationPage: React.FC = () => {
    const {state, initializeWizard} = useClassCreationWizard();
    const [isModalOpen, setIsModalOpen] = useState(true);

    const handleModalContinue = (selectedType: ClassType) => {
        initializeWizard(selectedType);
        setIsModalOpen(false);
    };

    if (state.isLoading) {
        return <Box sx={{display: 'flex', justifyContent: 'center', mt: 4}}><CircularProgress/></Box>;
    }

    if (state.fetchError) {
        return <Container><Alert severity="error" sx={{mt: 2}}>{state.fetchError}</Alert></Container>;
    }

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom>
                Create New Class for Timetable: {state.timetableStructure?.name}
            </Typography>

            <ClassTypeSelectionModal
                open={isModalOpen}
                onClose={() => window.history.back()}
                onContinue={handleModalContinue}
            />

            {!isModalOpen && state.selectedClassType && (
                <ClassCreationWizard/>
            )}
        </Container>
    );
};

export default ClassCreationPage;
