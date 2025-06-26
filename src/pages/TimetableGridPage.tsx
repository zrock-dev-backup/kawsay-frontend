import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Alert,
  Box,
  CircularProgress,
  Container,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { useTimetableStore } from "../stores/useTimetableStore.ts";
import ClassDetailsModal from "../components/ClassDetailsModal.tsx";
import TimetableLifecycleWizard from "./TimetableLifecycleWizard.tsx";
import TimetableToolboxView from "./TimetableToolboxView.tsx";

const useDetailsModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [classId, setClassId] = useState<number | null>(null);
  const openModal = (id: number) => {
    setClassId(id);
    setIsOpen(true);
  };
  const closeModal = () => {
    setIsOpen(false);
    setClassId(null);
  };
  return { isOpen, classId, openModal, closeModal };
};

const TimetableGridPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    isOpen: isDetailsModalOpen,
    classId: detailsClassId,
    openModal: openDetailsModal,
    closeModal: closeDetailsModal,
  } = useDetailsModal();

  const {
    structure,
    loading,
    error,
    generateStatus,
    fetchTimetableData,
    clearGenerateStatus,
  } = useTimetableStore();

  useEffect(() => {
    if (id) {
      fetchTimetableData(id);
    }
  }, [id, fetchTimetableData]);

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  if (error)
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  if (!structure)
    return (
      <Container>
        <Typography sx={{ mt: 2 }}>
          Timetable data could not be loaded.
        </Typography>
      </Container>
    );

  return (
    <>
      <Container maxWidth={false} sx={{ maxWidth: "95vw" }}>
        <Box sx={{ my: 2 }}>
          <Typography variant="h4" component="h1">
            {structure.name}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {dayjs(structure.startDate).format("MMMM D, YYYY")} -{" "}
            {dayjs(structure.endDate).format("MMMM D, YYYY")}
          </Typography>
        </Box>

        {generateStatus && (
          <Alert
            severity={generateStatus.type}
            sx={{ mb: 2 }}
            onClose={clearGenerateStatus}
          >
            {generateStatus.message}
          </Alert>
        )}

        {structure.status === "Published" ? (
          <TimetableToolboxView onLessonClick={openDetailsModal} />
        ) : (
          <TimetableLifecycleWizard />
        )}
      </Container>

      <ClassDetailsModal
        classId={detailsClassId}
        open={isDetailsModalOpen}
        onClose={closeDetailsModal}
      />
    </>
  );
};

export default TimetableGridPage;
