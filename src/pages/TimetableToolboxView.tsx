import React, { useMemo } from "react";
import { Box, Paper, Tab, Tabs, Typography } from "@mui/material";
import { useTimetableStore } from "../stores/useTimetableStore";
import { useCalendarControls } from "../hooks/timetable/useCalendarControls";
import dayjs from "dayjs";
import TimetableHeader from "../components/timetable/TimetableHeader";
import WeekView from "../components/timetable/WeekView";
import MonthView from "../components/timetable/MonthView";
import AcademicStructureManager from "../components/academic-structure/AcademicStructureManager";
import CourseRequirementsTab from "./CourseRequirementsTab";
import AssistedSchedulingTab from "./AssistedSchedulingTab";
import { StudentAuditTab } from "../components/audit/StudentAuditTab";
import { TabIndex } from "../utils/tabIndex.ts";

interface Props {
  onLessonClick: (classId: number) => void;
}

const TimetableToolboxView: React.FC<Props> = ({ onLessonClick }) => {
  const {
    structure,
    classes,
    activeTab,
    isGenerating,
    setActiveTab,
    generateSchedule,
  } = useTimetableStore();

  const calendarControls = useCalendarControls(
    structure ? dayjs(structure.startDate) : undefined,
  );

  const scheduleMap = useMemo(() => {
    const map = new Map<string, any[]>();
    if (!structure) return map;
    classes.forEach((cls) => {
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

  if (!structure) {
    return (
      <Typography sx={{ mt: 2 }}>
        Timetable data could not be loaded.
      </Typography>
    );
  }

  return (
    <>
      <TimetableHeader
        calendarControls={
          activeTab === TabIndex.SCHEDULE ? calendarControls : { view: null }
        }
        isGenerating={isGenerating}
        onGenerate={() => generateSchedule(structure.id.toString())}
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
              onLessonClick={onLessonClick}
              activeDays={structure.days}
            />
          ) : (
            <MonthView
              displayDate={calendarControls.displayDate}
              scheduleMap={scheduleMap}
              onLessonClick={onLessonClick}
            />
          ))}
        {activeTab === TabIndex.ACADEMIC_STRUCTURE && (
          <AcademicStructureManager />
        )}
        {activeTab === TabIndex.COURSE_REQUIREMENTS && (
          <CourseRequirementsTab timetableId={structure.id.toString()} />
        )}
        {activeTab === TabIndex.ASSISTED_SCHEDULING && (
          <AssistedSchedulingTab />
        )}
        {activeTab === TabIndex.AUDIT_STUDENTS && (
          <StudentAuditTab timetableId={structure.id.toString()} />
        )}
      </Box>
    </>
  );
};

export default TimetableToolboxView;
