import React, {useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Alert, Box, CircularProgress, Container, Paper, Tab, Tabs, Typography,} from '@mui/material';
import dayjs from 'dayjs';

import {useTimetableData} from '../hooks/timetable/useTimetableData.ts';
import {useCalendarControls} from '../hooks/timetable/useCalendarControls.ts';
import TimetableHeader from '../components/timetable/TimetableHeader.tsx';
import WeekView from '../components/timetable/WeekView.tsx';
import MonthView from '../components/timetable/MonthView.tsx';
import ClassDetailsModal from '../components/ClassDetailsModal';
import ClassListModal from '../components/ClassListModal';
import {generateScheduleForTimetable} from '../services/apiService';
import AcademicStructureManager from "../components/academic-structure/AcademicStructureManager.tsx";

const TimetableGridPage: React.FC = () => {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();

    const {structure, classes, loading, error, scheduleMap, sortedPeriods, refreshData} = useTimetableData(id);
    const calendarControls = useCalendarControls(structure ? dayjs(structure.startDate) : undefined);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
    const [isClassListModalOpen, setIsClassListModalOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generateStatus, setGenerateStatus] = useState<{
        type: 'success' | 'error' | 'warning';
        message: string
    } | null>(null);
    const [activeTab, setActiveTab] = useState(0);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const handleLessonClick = (classId: number) => {
        setSelectedClassId(classId);
        setIsModalOpen(true);
    };

    const handleGenerateClick = async () => {
        if (!id) return;
        setIsGenerating(true);
        setGenerateStatus(null);
        try {
            const result = await generateScheduleForTimetable(id);
            setGenerateStatus({type: 'success', message: result.message});
            refreshData();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setGenerateStatus({type: 'error', message: `Generation Error: ${errorMessage}`});
        } finally {
            setIsGenerating(false);
        }
    };

    if (loading) return <Box sx={{display: 'flex', justifyContent: 'center', mt: 4}}><CircularProgress/></Box>;
    if (error) return <Container><Alert severity="error" sx={{mt: 2}}>{error}</Alert></Container>;
    if (!structure) return <Container><Typography sx={{mt: 2}}>Timetable data could not be
        loaded.</Typography></Container>;

    return (
        <Container maxWidth="xl">
            <Box sx={{my: 2}}>
                <Typography variant="h4" component="h1">{structure.name}</Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    {dayjs(structure.startDate).format('MMMM D, YYYY')} - {dayjs(structure.endDate).format('MMMM D, YYYY')}
                </Typography>
            </Box>

            {generateStatus && (
                <Alert severity={generateStatus.type} sx={{mb: 2}} onClose={() => setGenerateStatus(null)}>
                    {generateStatus.message}
                </Alert>
            )}

            <Paper elevation={2}>
                <Box sx={{borderBottom: 5, borderColor: 'divider'}}>
                    <Tabs value={activeTab} onChange={handleTabChange} aria-label="timetable view tabs">
                        <Tab label="Timetable Grid"/>
                        <Tab label="Academic Structure"/>
                    </Tabs>
                </Box>
            </Paper>

            {activeTab === 0 && (
                <Box sx={{pt: 2}}>
                    <TimetableHeader
                        calendarControls={calendarControls}
                        isGenerating={isGenerating}
                        onGenerate={handleGenerateClick}
                        onAddClass={() => navigate(`/table/${id}/create-class`)}
                        onViewClasses={() => setIsClassListModalOpen(true)}
                        structure={structure}
                    />
                    {calendarControls.view === 'week' ? (
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
                </Box>
            )}
            {activeTab === 1 && (
                <AcademicStructureManager/>
            )}
            <ClassDetailsModal
                classId={selectedClassId}
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                timetableStructure={structure}
            />
            <ClassListModal
                open={isClassListModalOpen}
                onClose={() => setIsClassListModalOpen(false)}
                classes={classes}
                onClassSelect={(classId) => {
                    setIsClassListModalOpen(false);
                    handleLessonClick(classId);
                }}
                timetableName={structure.name}
            />
        </Container>
    );
};

export default TimetableGridPage;
