import React, {useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    CircularProgress,
    Alert,
} from '@mui/material';
import dayjs from 'dayjs';

import {useTimetableData} from '../hooks/timetable/useTimetableData.ts';
import {useCalendarControls} from '../hooks/timetable/useCalendarControls.ts';
import TimetableHeader from '../components/timetable/TimetableHeader.tsx';
import WeekView from '../components/timetable/WeekView.tsx';
import MonthView from '../components/timetable/MonthView.tsx';
import ClassDetailsModal from '../components/ClassDetailsModal';
import ClassListModal from '../components/ClassListModal';
import {generateScheduleForTimetable} from '../services/apiService';

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
            <TimetableHeader
                structure={structure}
                calendarControls={calendarControls}
                isGenerating={isGenerating}
                onGenerate={handleGenerateClick}
                onAddClass={() => navigate(`/table/${id}/create-class`)}
                onViewClasses={() => setIsClassListModalOpen(true)}
            />

            {generateStatus && (
                <Alert severity={generateStatus.type} sx={{mb: 2}} onClose={() => setGenerateStatus(null)}>
                    {generateStatus.message}
                </Alert>
            )}

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
