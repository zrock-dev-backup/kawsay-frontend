import React from 'react';
import {Typography, Box} from '@mui/material';
import {Dayjs} from 'dayjs';
import dayjs from 'dayjs';
import type {TimetablePeriod, TimetableDay} from '../../interfaces/apiDataTypes.ts';

import {
    GridContainer,
    DayHeaderCell,
    TimeLabelCell,
    BackgroundCell,
    SingleEventPaper,
    EventStack,
    EventChip,
    TopLeftCell
} from './WeekView.styles.ts';

interface GridCellContent {
    classId: number;
    courseName: string;
    courseCode: string; // Ensure this is here
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

    return (
        <GridContainer sx={{gridTemplateRows: `auto repeat(${periodCount}, minmax(60px, auto))`}}>
            {/* Top-left empty cell */}
            <TopLeftCell sx={{gridRow: 1, gridColumn: 1}}/>

            {/* Day Headers */}
            {weekDays.map((day) => {
                const dayName = day.format('dddd');
                const isActive = activeDayNames.has(dayName);
                return (
                    <DayHeaderCell
                        key={day.format('YYYY-MM-DD')}
                        isactive={isActive.toString() as 'true' | 'false'}
                        sx={{gridRow: 1, gridColumn: dayToColumnIndexMap.get(day.day())}}
                    >
                        <Typography variant="caption" sx={{textTransform: 'uppercase'}}>{day.format('ddd')}</Typography>
                        <Typography variant="h6">{day.format('D')}</Typography>
                    </DayHeaderCell>
                );
            })}

            {/* Time Labels & Background Grid Cells */}
            {sortedPeriods.map((period, periodIndex) => (
                <React.Fragment key={period.id}>
                    <TimeLabelCell sx={{gridRow: periodIndex + 2, gridColumn: 1}}>
                        <Typography variant="caption" color="text.secondary" sx={{position: 'relative', top: '-0.5em'}}>
                            {period.start}
                        </Typography>
                    </TimeLabelCell>
                    {weekDays.map((day, dayIndex) => (
                        <BackgroundCell
                            key={`${period.id}-${day.format('D')}`}
                            sx={{gridRow: periodIndex + 2, gridColumn: dayIndex + 2}}
                        />
                    ))}
                </React.Fragment>
            ))}

            {/* Render Events */}
            {Array.from(scheduleMap.entries()).map(([key, contents]) => {
                const [dateStr, periodIdStr] = key.split('_');
                const eventDate = dayjs(dateStr);
                const startPeriodId = parseInt(periodIdStr, 10);

                const gridRowStart = periodIdToRowIndexMap.get(startPeriodId);
                const gridColumn = dayToColumnIndexMap.get(eventDate.day());

                if (!gridRowStart || !gridColumn || contents.length === 0) return null;

                const firstEvent = contents[0];
                const eventLength = firstEvent.length;

                const eventContainerStyle = {
                    gridColumn,
                    gridRowStart,
                    gridRowEnd: `span ${eventLength}`,
                };

                if (contents.length === 1) {
                    // --- RENDER SINGLE EVENT ---
                    return (
                        <Box key={key} sx={eventContainerStyle}>
                            <SingleEventPaper
                                elevation={0}
                                onClick={() => onLessonClick(firstEvent.classId)}
                            >
                                <Typography variant="body2" fontWeight="bold" noWrap>
                                    {firstEvent.courseCode}
                                </Typography>
                                <Typography variant="caption" noWrap>
                                    {firstEvent.teacherName}
                                </Typography>
                            </SingleEventPaper>
                        </Box>
                    );
                } else {
                    // --- RENDER STACKED EVENTS ---
                    return (
                        <EventStack key={key} sx={eventContainerStyle}>
                            {contents.map(event => (
                                <EventChip
                                    key={event.classId}
                                    label={event.courseCode}
                                    onClick={() => onLessonClick(event.classId)}
                                    size="small"
                                    title={`${event.courseName} - ${event.teacherName}`}
                                />
                            ))}
                        </EventStack>
                    );
                }
            })}
        </GridContainer>
    );
};

export default WeekView;
