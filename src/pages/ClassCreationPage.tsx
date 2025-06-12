import React, {useState} from 'react';
import {Alert, Box, CircularProgress, Container, Typography} from '@mui/material';
import {useClassCreationWizard} from '../hooks/lecture/useClassCreationWizard.ts';
import {ClassTypeSelectionModal} from '../components/class-creation/ClassTypeSelectionModal.tsx';
import {ClassCreationWizard} from '../components/class-creation/ClassCreationWizard.tsx';
import type {ClassType} from '../interfaces/classDtos.ts';

const ClassCreationPage: React.FC = () => {
    const wizard = useClassCreationWizard();
    const [isModalOpen, setIsModalOpen] = useState(true);

    const handleModalContinue = (selectedType: ClassType) => {
        wizard.initializeWizard(selectedType);
        setIsModalOpen(false);
    };
    if (wizard.state.isLoading) {
        return <Box sx={{display: 'flex', justifyContent: 'center', mt: 4}}><CircularProgress/></Box>;
    }
    if (wizard.state.fetchError) {
        return <Container><Alert severity="error" sx={{mt: 2}}>{wizard.state.fetchError}</Alert></Container>;
    }

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom>
                Class creation
            </Typography>

            {wizard.state.submitStatus && (
                <Alert severity={wizard.state.submitStatus.type} sx={{my: 2}}>
                    {wizard.state.submitStatus.message}
                </Alert>
            )}

            <ClassTypeSelectionModal
                open={isModalOpen}
                onClose={() => window.history.back()}
                onContinue={handleModalContinue}
            />

            {!isModalOpen && wizard.state.form.classType && (
                <ClassCreationWizard wizard={wizard}/>
            )}
        </Container>
    );
};

export default ClassCreationPage;
