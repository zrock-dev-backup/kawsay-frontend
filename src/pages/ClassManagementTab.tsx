import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import { useClassCreationWizard } from "../hooks/lecture/useClassCreationWizard.ts";
import { ClassCreationWizard } from "../components/class-creation/ClassCreationWizard.tsx";
import ClassList from "../components/class-creation/ClassList.tsx";
import { ClassTypeSelectionModal } from "../components/class-creation/ClassTypeSelectionModal.tsx";
import type { ClassType } from "../interfaces/classDtos.ts";
import { useTimetableStore } from "../stores/useTimetableStore.ts";
import { deleteClass } from "../services/apiClassService.ts";
import ConfirmationDialog from "../components/common/ConfirmationDialog.tsx";

interface Props {
  timetableId: string;
}

const ClassManagementTab: React.FC<Props> = ({ timetableId }) => {
  const {
    classes,
    loading: isLoadingList,
    error: listError,
    refreshData,
  } = useTimetableStore();

  const wizard = useClassCreationWizard(timetableId);

  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [classToDelete, setClassToDelete] = useState<number | null>(null);

  const handleSelectClass = useCallback(
    (id: number | null) => {
      setSelectedClassId(id);
      if (id === null) {
        setIsTypeModalOpen(true);
      } else {
        wizard.initializeForMode(id, "Masterclass");
      }
    },
    [wizard],
  );

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
        handleSelectClass(null);
      }
    } catch (err) {
      console.error("Failed to delete class", err);
    } finally {
      setIsConfirmingDelete(false);
      setClassToDelete(null);
    }
  };

  useEffect(() => {
    const handleSuccess = async () => {
      if (wizard.state.submitStatus?.type === "success") {
        await refreshData();

        const isCreating = wizard.state.form.id === null;
        if (isCreating) {
          handleSelectClass(null);
        }
      }
    };
    handleSuccess();
  }, [
    wizard.state.submitStatus,
    refreshData,
    wizard.state.form.id,
    handleSelectClass,
  ]);

  return (
    <>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Classes
            </Typography>
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
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 2, minHeight: "65vh" }}>
            {wizard.state.submitStatus && (
              <Alert severity={wizard.state.submitStatus.type} sx={{ mb: 2 }}>
                {wizard.state.submitStatus.message}
              </Alert>
            )}
            {wizard.state.isLoading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
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
