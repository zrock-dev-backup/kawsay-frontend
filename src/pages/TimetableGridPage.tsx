import React, {useState} from 'react';
import {useParams} from 'react-router-dom';
import {Alert, Box, CircularProgress, Container, Paper, Tab, Tabs, Typography} from '@mui/material';
import dayjs from 'dayjs';
import {useTimetableData} from '../hooks/timetable/useTimetableData.ts';
import {useCalendarControls} from '../hooks/timetable/useCalendarControls.ts';
import TimetableHeader from '../components/timetable/TimetableHeader.tsx';
import WeekView from '../components/timetable/WeekView.tsx';
import MonthView from '../components/timetable/MonthView.tsx';
import {generateScheduleForTimetable} from '../services/apiService';
import ClassManagementTab from "./ClassManagementTab.tsx";
import AcademicStructureManager from "../components/academic-structure/AcademicStructureManager.tsx";

const TimetableGridPage: React.FC = () => {
    const {id} = useParams<{ id: string }>();
    const {structure, loading, error, scheduleMap, sortedPeriods, refreshData} = useTimetableData(id);
    const calendarControls = useCalendarControls(structure ? dayjs(structure.startDate) : undefined);

    const [isGenerating, setIsGenerating] = useState(false);
    const [generateStatus, setGenerateStatus] = useState<{
        type: 'success' | 'error' | 'warning';
        message: string
    } | null>(null);
    const [activeTab, setActiveTab] = useState(0);

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
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
        <Container maxWidth={false} sx={{maxWidth: '95vw'}}>
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
                <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                    <Tabs value={activeTab} onChange={handleTabChange} aria-label="timetable view tabs">
                        <Tab label="Timetable Grid"/>
                        <Tab label="Class Management"/>
                        <Tab label="Academic Structure"/>
                    </Tabs>
                </Box>
            </Paper>

            <Box sx={{mt: 2}}>
                {activeTab === 0 && (
                    <>
                        <TimetableHeader
                            calendarControls={calendarControls}
                            isGenerating={isGenerating} onGenerate={handleGenerateClick}
                        />
                        {calendarControls.view === 'week' ?
                            <WeekView displayDate={calendarControls.displayDate} scheduleMap={scheduleMap}
                                      sortedPeriods={sortedPeriods} onLessonClick={() => {
                            }} activeDays={structure.days}/> :
                            <MonthView displayDate={calendarControls.displayDate} scheduleMap={scheduleMap}
                                       onLessonClick={() => {
                                       }}/>
                        }
                    </>
                )}
                {activeTab === 1 && <ClassManagementTab timetableId={id!} key={structure.id}/>}
                {activeTab === 2 && <AcademicStructureManager/>}
            </Box>
        </Container>
    );
};

export default TimetableGridPage;
