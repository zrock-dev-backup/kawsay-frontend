import React, { useEffect, useMemo, useState } from "react";
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
import AcademicStructureManager from "../components/academic-structure/AcademicStructureManager.tsx";
import { useTimetableStore } from "../stores/useTimetableStore.ts";
import ClassDetailsModal from "../components/ClassDetailsModal.tsx";
import type { Class } from "../interfaces/classDtos.ts";
import CourseRequirementsTab from "./CourseRequirementsTab.tsx";
import AssistedSchedulingTab from "./AssistedSchedulingTab.tsx";
import { StudentAuditTab } from "../components/audit/StudentAuditTab";

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

enum TabIndex {
  ACADEMIC_STRUCTURE = 0,
  COURSE_REQUIREMENTS = 1,
  ASSISTED_SCHEDULING = 2,
  AUDIT_STUDENTS = 3,
  SCHEDULE = 4,
}

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
    classes,
    loading,
    error,
    activeTab,
    isGenerating,
    generateStatus,
    fetchTimetableData,
    setActiveTab,
    generateSchedule,
    clearGenerateStatus,
  } = useTimetableStore();

  useEffect(() => {
    if (id) {
      fetchTimetableData(id);
    }
  }, [id, fetchTimetableData]);

  const calendarControls = useCalendarControls(
    structure ? dayjs(structure.startDate) : undefined,
  );

  const scheduleMap = useMemo(() => {
    const map = new Map<string, any[]>();
    if (!structure) return map;
    classes.forEach((cls: Class) => {
      cls.classOccurrences?.forEach((occ) => {
        const key = `${occ.date}_${occ.startPeriodId}`;
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push({
          classId: cls.id,
          courseName: cls.courseName,
          courseCode: cls.courseCode,
          teacherName: cls.teacherName,
          length: cls.length,
        });
      });
    });
    return map;
  }, [structure, classes]);

  const sortedPeriods = useMemo(() => {
    if (!structure?.periods) return [];
    return [...structure.periods].sort((a, b) =>
      a.start.localeCompare(b.start),
    );
  }, [structure?.periods]);

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

        <TimetableHeader
          calendarControls={
            activeTab === TabIndex.SCHEDULE ? calendarControls : { view: null }
          }
          isGenerating={isGenerating}
          onGenerate={() => generateSchedule(id!)}
        />

        <Paper elevation={2}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={activeTab}
              onChange={(_, val) => setActiveTab(val)}
              aria-label="timetable view tabs"
              variant="fullWidth"
            >
              <Tab label="Academic structure management" />
              <Tab label="Module requirements" />
              <Tab label="Scheduling Assistant" />
              <Tab label="Student Enrollment Audit" />
              <Tab label="Schedule" />
            </Tabs>
          </Box>
        </Paper>

        <Box sx={{ mt: 2 }}>
          {activeTab === TabIndex.SCHEDULE &&
            (calendarControls.view === "week" ? (
              <WeekView
                displayDate={calendarControls.displayDate}
                scheduleMap={scheduleMap}
                sortedPeriods={sortedPeriods}
                onLessonClick={openDetailsModal}
                activeDays={structure.days}
              />
            ) : (
              <MonthView
                displayDate={calendarControls.displayDate}
                scheduleMap={scheduleMap}
                onLessonClick={openDetailsModal}
              />
            ))}
          {activeTab === TabIndex.ACADEMIC_STRUCTURE && (
            <AcademicStructureManager />
          )}
          {activeTab === TabIndex.COURSE_REQUIREMENTS && (
            <CourseRequirementsTab timetableId={id!} />
          )}
          {activeTab === TabIndex.ASSISTED_SCHEDULING && (
            <AssistedSchedulingTab />
          )}

          {activeTab === TabIndex.AUDIT_STUDENTS && (
            <StudentAuditTab timetableId={id!} />
          )}
        </Box>
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
