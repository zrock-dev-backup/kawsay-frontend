import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Box, CircularProgress, Grid, Paper, Typography } from '@mui/material';
import { useClassCreationWizard } from '../hooks/lecture/useClassCreationWizard';
import { ClassCreationWizard } from '../components/class-creation/ClassCreationWizard';
import ClassList from '../components/class-creation/ClassList';
import { ClassTypeSelectionModal } from '../components/class-creation/ClassTypeSelectionModal';
import type { ClassType } from '../interfaces/classDtos';
import { useTimetableData } from '../hooks/timetable/useTimetableData';
import { deleteClass } from '../services/apiClassService';
import ConfirmationDialog from '../components/common/ConfirmationDialog';

interface Props {
    timetableId: string;
}

const ClassManagementTab: React.FC<Props> = ({ timetableId }) => {
    const { classes, loading: isLoadingList, error: listError, refreshData } = useTimetableData(timetableId);
    const wizard = useClassCreationWizard(timetableId);

    const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
    const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const [classToDelete, setClassToDelete] = useState<number | null>(null);

    const handleSelectClass = useCallback((id: number | null) => {
        setSelectedClassId(id);
        if (id === null) {
            setIsTypeModalOpen(true); // Open modal to choose type for new class
        } else {
            wizard.initializeForMode(id, 'Masterclass'); // Type will be overwritten by fetch
        }
    }, [wizard]);

    const handleNewClassTypeSelect = (type: ClassType) => {
        setIsTypeModalOpen(false);
        wizard.initializeForMode(null, type);
    };

    const handleDeleteRequest = (id: number) => {
        setClassToDelete(id);
        setIsConfirmingDelete(true);
    };

    const handleDeleteConfirm = async () => {
        if (!classToDelete) return;
        try {
            await deleteClass(classToDelete);
            refreshData();
            if (selectedClassId === classToDelete) {
                handleSelectClass(null); // Deselect if the deleted class was being edited
            }
        } catch (err) {
            console.error("Failed to delete class", err);
        } finally {
            setIsConfirmingDelete(false);
            setClassToDelete(null);
        }
    };
    
    useEffect(() => {
        if (wizard.state.submitStatus?.type === 'success') {
            refreshData();
        }
    }, [wizard.state.submitStatus, refreshData]);

    return (
        <>
            <Grid container spacing={3}>
                <Grid size={{xs:12, md:4}}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>Classes</Typography>
                        <ClassList
                            classes={classes}
                            isLoading={isLoadingList}
                            error={listError}
                            onSelectClass={handleSelectClass}
                            onDeleteClass={handleDeleteRequest}
                            selectedClassId={selectedClassId}
                        />
                    </Paper>
                </Grid>
                <Grid size={{xs:12, md:8}}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                        {wizard.state.submitStatus && (
                            <Alert severity={wizard.state.submitStatus.type} sx={{ mb: 2 }}>
                                {wizard.state.submitStatus.message}
                            </Alert>
                        )}
                        {wizard.state.isLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                             <ClassCreationWizard wizard={wizard} key={selectedClassId} />
                        )}
                    </Paper>
                </Grid>
            </Grid>

            <ClassTypeSelectionModal
                open={isTypeModalOpen}
                onClose={() => setIsTypeModalOpen(false)}
                onContinue={handleNewClassTypeSelect}
            />

            <ConfirmationDialog
                open={isConfirmingDelete}
                onClose={() => setIsConfirmingDelete(false)}
                onConfirm={handleDeleteConfirm}
                title="Confirm Deletion"
                description="Are you sure you want to delete this class? This will also remove any scheduled occurrences."
                confirmText="Delete"
            />
        </>
    );
};

export default ClassManagementTab;
