import React from 'react';
import {Button, CircularProgress, IconButton, Stack, ToggleButton, ToggleButtonGroup, Typography,} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ViewListIcon from '@mui/icons-material/ViewList';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import type {TimetableStructure} from '../../interfaces/apiDataTypes.ts';
import type {useCalendarControls} from '../../hooks/timetable/useCalendarControls.ts';

interface TimetableHeaderProps {
    structure: TimetableStructure;
    calendarControls: ReturnType<typeof useCalendarControls>;
    isGenerating: boolean;
    onGenerate: () => void;
    onAddClass: () => void;
    onViewClasses: () => void;
}

const TimetableHeader: React.FC<TimetableHeaderProps> = ({
                                                             calendarControls,
                                                             isGenerating,
                                                             onGenerate,
                                                             onAddClass,
                                                             onViewClasses,
                                                         }) => {
    const {view, displayDate, handleViewChange, handlePrev, handleNext, handleToday} = calendarControls;

    return (
        <>
            <Stack direction="row" justifyContent="space-between" alignItems="center"
                   sx={{mb: 2, flexWrap: 'wrap', gap: 2}}>
                <Stack direction="row" spacing={1} alignItems="center">
                    <IconButton onClick={handlePrev} aria-label="previous period"><ChevronLeftIcon/></IconButton>
                    <Button variant="outlined" onClick={handleToday}>Today</Button>
                    <IconButton onClick={handleNext} aria-label="next period"><ChevronRightIcon/></IconButton>
                    <Typography variant="h6">
                        {view === 'week' ? displayDate.format('MMM D, YYYY') : displayDate.format('MMMM YYYY')}
                    </Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                    <ToggleButtonGroup value={view} exclusive onChange={handleViewChange} size="small">
                        <ToggleButton value="week">Week</ToggleButton>
                        <ToggleButton value="month">Month</ToggleButton>
                    </ToggleButtonGroup>
                    <Button variant="outlined" startIcon={<ViewListIcon/>} onClick={onViewClasses}>View Classes</Button>
                    <Button variant="contained" startIcon={<AddIcon/>} onClick={onAddClass}>Add Class</Button>
                    <Button variant="outlined"
                            startIcon={isGenerating ? <CircularProgress size={20}/> : <AutoAwesomeIcon/>}
                            onClick={onGenerate} disabled={isGenerating}>
                        {isGenerating ? 'Generating...' : 'Generate Schedule'}
                    </Button>
                </Stack>
            </Stack>
        </>
    );
};

export default TimetableHeader;
