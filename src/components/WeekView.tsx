import React from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Stack,
    Chip,
} from '@mui/material';
import {Dayjs} from 'dayjs';
import type {TimetablePeriod} from '../interfaces/apiDataTypes';

// Define types locally or import them
interface GridCellContent {
    classId: number;
    courseName: string;
}

type ProcessedScheduleMap = Map<string, GridCellContent[]>;

interface WeekViewProps {
    displayDate: Dayjs;
    scheduleMap: ProcessedScheduleMap;
    sortedPeriods: TimetablePeriod[];
    onLessonClick: (classId: number) => void;
}

const WeekView: React.FC<WeekViewProps> = ({displayDate, scheduleMap, sortedPeriods, onLessonClick}) => {
    const startOfWeek = displayDate.startOf('week');
    const weekDays = Array.from({length: 7}, (_, i) => startOfWeek.add(i, 'day'));

    return (
        <TableContainer component={Paper} elevation={3}>
            <Table sx={{minWidth: 700}}>
                <TableHead sx={{backgroundColor: 'grey.200'}}>
                    <TableRow>
                        <TableCell sx={{fontWeight: 'bold', minWidth: 120}}>Time</TableCell>
                        {weekDays.map(day => (
                            <TableCell key={day.format('YYYY-MM-DD')} align="center" sx={{fontWeight: 'bold'}}>
                                {day.format('ddd, MMM D')}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {sortedPeriods.map(period => (
                        <TableRow key={period.id} hover>
                            <TableCell component="th" scope="row" sx={{fontWeight: 'medium'}}>
                                {`${period.start} - ${period.end}`}
                            </TableCell>
                            {weekDays.map(day => {
                                const dateKey = `${day.format('YYYY-MM-DD')}_${period.id}`;
                                const occurrences = scheduleMap.get(dateKey) || [];
                                return (
                                    <TableCell key={dateKey}
                                               sx={{verticalAlign: 'top', p: 0.5, border: '1px solid #eee'}}>
                                        <Stack spacing={0.5}>
                                            {occurrences.map((content, index) => (
                                                <Chip key={index} label={content.courseName}
                                                      onClick={() => onLessonClick(content.classId)} size="small"/>
                                            ))}
                                        </Stack>
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default WeekView;
