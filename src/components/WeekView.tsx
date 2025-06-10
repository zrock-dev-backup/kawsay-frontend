import React from 'react';
import {Typography} from '@mui/material';
import {Dayjs} from 'dayjs';
import dayjs from 'dayjs';
import type {TimetablePeriod, TimetableDay} from '../interfaces/apiDataTypes';

import {
    GridContainer,
    DayHeaderCell,
    TimeLabelCell,
    BackgroundCell,
    EventPaper,
    TopLeftCell
} from './WeekView.styles';

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
                    {/* Time Label */}
                    <TimeLabelCell
                        sx={{
                            gridRow: periodIndex + 2,
                            gridColumn: 1,
                        }}
                    >
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{position: 'relative', top: '-0.5em'}}
                        >
                            {period.start}
                        </Typography>
                    </TimeLabelCell>
                    {/* Background Cells for this row */}
                    {weekDays.map((day, dayIndex) => (
                        <BackgroundCell
                            key={`${period.id}-${day.format('D')}`}
                            sx={{
                                gridRow: periodIndex + 2,
                                gridColumn: dayIndex + 2,
                            }}
                        />
                    ))}
                </React.Fragment>
            ))}

            {/* Event Blocks */}
            {eventsToRender.map(event => (
                <EventPaper
                    key={event.id}
                    elevation={0}
                    onClick={() => onLessonClick(event.classId)}
                    sx={{
                        gridColumn: event.gridColumn,
                        gridRowStart: event.gridRowStart,
                        gridRowEnd: `span ${event.length}`,
                    }}
                >
                    <Typography variant="caption" noWrap>{event.timeString}</Typography>
                    <Typography variant="body2" fontWeight="bold" noWrap>{event.courseName}</Typography>
                </EventPaper>
            ))}
        </GridContainer>
    );
};
export default WeekView;
