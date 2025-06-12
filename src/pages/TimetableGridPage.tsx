import React from "react";
import { useParams } from "react-router-dom";
import {
  Alert,
  Box,
  CircularProgress,
  Container,
  Paper,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { useCalendarControls } from "../hooks/timetable/useCalendarControls.ts";
import TimetableHeader from "../components/timetable/TimetableHeader.tsx";
import WeekView from "../components/timetable/WeekView.tsx";
import MonthView from "../components/timetable/MonthView.tsx";
import ClassManagementTab from "./ClassManagementTab.tsx";
import AcademicStructureManager from "../components/academic-structure/AcademicStructureManager.tsx";
import { useTimetableGridPage } from "../hooks/timetable/useTimetableGridPage.ts";
import ClassDetailsModal from "../components/ClassDetailsModal.tsx";

const TimetableGridPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const {
    structure,
    loading,
    error,
    scheduleMap,
    sortedPeriods,
    pageState,
    handleTabChange,
    handleGenerateClick,
    handleLessonClick,
    handleCloseDetailsModal,
    setGenerateStatus,
  } = useTimetableGridPage(id);

  const calendarControls = useCalendarControls(
    structure ? dayjs(structure.startDate) : undefined,
  );

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

        {pageState.generateStatus && (
          <Alert
            severity={pageState.generateStatus.type}
            sx={{ mb: 2 }}
            onClose={() => setGenerateStatus(null)}
          >
            {pageState.generateStatus.message}
          </Alert>
        )}

        <Paper elevation={2}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={pageState.activeTab}
              onChange={handleTabChange}
              aria-label="timetable view tabs"
            >
              <Tab label="Timetable Grid" />
              <Tab label="Class Management" />
              <Tab label="Academic Structure" />
            </Tabs>
          </Box>
        </Paper>

        <Box sx={{ mt: 2 }}>
          {pageState.activeTab === 0 && (
            <>
              <TimetableHeader
                calendarControls={calendarControls}
                isGenerating={pageState.isGenerating}
                onGenerate={handleGenerateClick}
              />
              {calendarControls.view === "week" ? (
                <WeekView
                  displayDate={calendarControls.displayDate}
                  scheduleMap={scheduleMap}
                  sortedPeriods={sortedPeriods}
                  onLessonClick={handleLessonClick}
                  activeDays={structure.days}
                />
              ) : (
                <MonthView
                  displayDate={calendarControls.displayDate}
                  scheduleMap={scheduleMap}
                  onLessonClick={handleLessonClick}
                />
              )}
            </>
          )}
          {pageState.activeTab === 1 && (
            <ClassManagementTab timetableId={id!} />
          )}
          {pageState.activeTab === 2 && <AcademicStructureManager />}
        </Box>
      </Container>

      <ClassDetailsModal
        classId={pageState.selectedClassId}
        open={pageState.isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
      />
    </>
  );
};

export default TimetableGridPage;
