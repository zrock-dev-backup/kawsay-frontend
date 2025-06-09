import React from 'react';
import {Box, Paper, Typography} from '@mui/material';
import {Dayjs} from 'dayjs';
import dayjs from 'dayjs';
import type {TimetablePeriod, TimetableDay} from '../interfaces/apiDataTypes';

interface GridCellContent {
    classId: number;
    courseName: string;
    teacherName: string | null;
    length: number;
}

type ProcessedScheduleMap = Map<string, GridCellContent[]>;

interface WeekViewProps {
    displayDate: Dayjs;
    scheduleMap: ProcessedScheduleMap;
    sortedPeriods: TimetablePeriod[];
    onLessonClick: (classId: number) => void;
    activeDays: TimetableDay[];
}

const WeekView: React.FC<WeekViewProps> = ({
                                               displayDate,
                                               scheduleMap,
                                               sortedPeriods,
                                               onLessonClick,
                                               activeDays,
                                           }) => {
    const startOfWeek = displayDate.startOf('week');
    const weekDays = Array.from({length: 7}, (_, i) => startOfWeek.add(i, 'day'));
    const periodCount = sortedPeriods.length;
    const activeDayNames = new Set(activeDays.map(d => d.name));

    const periodIdToRowIndexMap = new Map<number, number>();
    sortedPeriods.forEach((period, index) => {
        periodIdToRowIndexMap.set(period.id, index + 2);
    });
    const dayToColumnIndexMap = new Map<number, number>();
    weekDays.forEach((day, index) => {
        dayToColumnIndexMap.set(day.day(), index + 2);
    });

    const eventsToRender = Array.from(scheduleMap.entries()).flatMap(([key, contents]) => {
        const [dateStr, periodIdStr] = key.split('_');
        const eventDate = dayjs(dateStr);
        const startPeriodId = parseInt(periodIdStr, 10);

        const gridRowStart = periodIdToRowIndexMap.get(startPeriodId);
        const gridColumn = dayToColumnIndexMap.get(eventDate.day());

        if (!gridRowStart || !gridColumn) return [];

        const startPeriodIndex = sortedPeriods.findIndex(p => p.id === startPeriodId);
        if (startPeriodIndex === -1) return [];

        return contents.map(content => {
            const endPeriodIndex = startPeriodIndex + content.length - 1;
            const startPeriod = sortedPeriods[startPeriodIndex];
            const endPeriod = sortedPeriods[endPeriodIndex] || startPeriod;

            return {
                ...content,
                id: `${key}-${content.classId}`,
                gridRowStart,
                gridColumn,
                timeString: `${startPeriod.start} - ${endPeriod.end}`,
            };
        });
    });

    return (
        <Paper elevation={3} sx={{overflow: 'hidden'}}>
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: '60px repeat(7, 1fr)',
                    gridTemplateRows: `auto repeat(${periodCount}, minmax(60px, auto))`,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    minWidth: '800px',
                }}
            >
                {/* Top-left empty cell */}
                <Box sx={{
                    gridRow: 1,
                    gridColumn: 1,
                    borderRight: '1px solid',
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                }}/>

                {/* Day Headers */}
                {weekDays.map((day) => {
                    const dayName = day.format('dddd');
                    const isActive = activeDayNames.has(dayName);
                    return (
                        <Box
                            key={day.format('YYYY-MM-DD')}
                            sx={{
                                gridRow: 1,
                                gridColumn: dayToColumnIndexMap.get(day.day()),
                                p: 1,
                                textAlign: 'center',
                                borderBottom: '1px solid',
                                borderLeft: '1px solid',
                                borderColor: 'divider',
                                // Visually distinguish active vs inactive days
                                bgcolor: isActive ? 'grey.100' : 'grey.50',
                                color: isActive ? 'text.primary' : 'text.disabled',
                            }}
                        >
                            <Typography variant="caption"
                                        sx={{textTransform: 'uppercase'}}>{day.format('ddd')}</Typography>
                            <Typography variant="h6">{day.format('D')}</Typography>
                        </Box>
                    );
                })}

                {sortedPeriods.map((period, periodIndex) => (
                    <React.Fragment key={period.id}>
                        {/* Time Label */}
                        <Box
                            sx={{
                                gridRow: periodIndex + 2,
                                gridColumn: 1,
                                p: 1,
                                textAlign: 'right',
                                borderRight: '1px solid',
                                borderTop: '1px solid',
                                borderColor: 'divider',
                                position: 'relative',
                            }}
                        >
                            <Typography variant="caption" color="text.secondary"
                                        sx={{position: 'relative', top: '-0.5em'}}>
                                {period.start}
                            </Typography>
                        </Box>

                        {/* Background Cells for this row */}
                        {weekDays.map((day, dayIndex) => (
                            <Box
                                key={`${period.id}-${day.format('D')}`}
                                sx={{
                                    gridRow: periodIndex + 2,
                                    gridColumn: dayIndex + 2,
                                    borderTop: '1px solid',
                                    borderLeft: '1px solid',
                                    borderColor: 'divider',
                                }}
                            />
                        ))}
                    </React.Fragment>
                ))}

                {/* Event Blocks */}
                {eventsToRender.map(event => (
                    <Paper
                        key={event.id}
                        elevation={0}
                        onClick={() => onLessonClick(event.classId)}
                        sx={{
                            gridColumn: event.gridColumn,
                            gridRowStart: event.gridRowStart,
                            gridRowEnd: `span ${event.length}`,
                            m: '2px',
                            p: 1,
                            bgcolor: 'primary.light',
                            color: 'primary.contrastText',
                            cursor: 'pointer',
                            overflow: 'hidden',
                            zIndex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            '&:hover': {
                                bgcolor: 'primary.main',
                                boxShadow: 3,
                            },
                        }}
                    >
                        <Typography variant="caption" noWrap>{event.timeString}</Typography>
                        <Typography variant="body2" fontWeight="bold" noWrap>{event.courseName}</Typography>
                    </Paper>
                ))}
            </Box>
        </Paper>
    );
};

export default WeekView;
