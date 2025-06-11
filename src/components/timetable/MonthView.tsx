import React from 'react';
import {Chip, Paper} from '@mui/material';
import {Dayjs} from 'dayjs';
import {ChipContainer, DayCell, DayNumber, MonthDayHeader, MonthGridContainer} from './MonthView.styles.ts';

interface GridCellContent {
    classId: number;
    courseName: string;
}

type ProcessedScheduleMap = Map<string, GridCellContent[]>;

interface MonthViewProps {
    displayDate: Dayjs;
    scheduleMap: ProcessedScheduleMap;
    onLessonClick: (classId: number) => void;
}

const MonthView: React.FC<MonthViewProps> = ({displayDate, scheduleMap, onLessonClick}) => {
    const startOfMonth = displayDate.startOf('month');
    const startDay = startOfMonth.startOf('week');
    const daysInMonthGrid = Array.from({length: 42}, (_, i) => startDay.add(i, 'day'));
    const weekDayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <Paper elevation={3} sx={{overflow: 'hidden'}}>
            <MonthGridContainer>
                {/* Render Day Headers */}
                {weekDayHeaders.map(day => (
                    <MonthDayHeader key={day}>{day}</MonthDayHeader>
                ))}

                {/* Render Day Cells */}
                {daysInMonthGrid.map(day => {
                    const isCurrentMonth = day.isSame(displayDate, 'month');
                    const dateKey = day.format('YYYY-MM-DD');

                    const occurrencesForDay = Array.from(scheduleMap.entries())
                        .filter(([key, _]) => key.startsWith(dateKey))
                        .flatMap(([_, value]) => value);

                    return (
                        <DayCell
                            key={dateKey}
                            iscurrentmonth={isCurrentMonth.toString() as 'true' | 'false'}
                        >
                            <DayNumber
                                variant="body2"
                                iscurrentmonth={isCurrentMonth.toString() as 'true' | 'false'}
                            >
                                {day.date()}
                            </DayNumber>
                            <ChipContainer spacing={0.5}>
                                {occurrencesForDay.map((content, index) => (
                                    <Chip
                                        key={`${content.classId}-${index}`}
                                        label={content.courseName}
                                        onClick={() => onLessonClick(content.classId)}
                                        size="small"
                                        sx={{
                                            maxWidth: '98%',
                                            justifyContent: 'flex-start',
                                        }}
                                    />
                                ))}
                            </ChipContainer>
                        </DayCell>
                    );
                })}
            </MonthGridContainer>
        </Paper>
    );
};

export default MonthView;
