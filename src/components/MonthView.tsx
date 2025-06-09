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
    Typography,
} from '@mui/material';
import { Dayjs } from 'dayjs';

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

const MonthView: React.FC<MonthViewProps> = ({ displayDate, scheduleMap, onLessonClick }) => {
    const startOfMonth = displayDate.startOf('month');
    const startDay = startOfMonth.startOf('week');
    const daysInMonthGrid = Array.from({ length: 42 }, (_, i) => startDay.add(i, 'day'));

    return (
        <TableContainer component={Paper} elevation={3}>
            <Table sx={{ tableLayout: 'fixed' }}>
                <TableHead>
                    <TableRow>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <TableCell key={day} align="center" sx={{ fontWeight: 'bold', p: 1 }}>{day}</TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {Array.from({ length: 6 }).map((_, weekIndex) => (
                        <TableRow key={weekIndex}>
                            {daysInMonthGrid.slice(weekIndex * 7, (weekIndex + 1) * 7).map(day => {
                                const isCurrentMonth = day.isSame(displayDate, 'month');
                                const dateKey = day.format('YYYY-MM-DD');

                                const occurrencesForDay = Array.from(scheduleMap.entries())
                                    .filter(([key, _]) => key.startsWith(dateKey))
                                    .flatMap(([_, value]) => value);

                                return (
                                    <TableCell key={dateKey} sx={{ verticalAlign: 'top', height: 120, border: '1px solid #eee', p: 0.5, bgcolor: isCurrentMonth ? 'inherit' : 'grey.50' }}>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: isCurrentMonth ? 'text.primary' : 'text.disabled' }}>{day.date()}</Typography>
                                        <Stack spacing={0.5} sx={{ overflowY: 'auto', maxHeight: 80 }}>
                                            {occurrencesForDay.map((content, index) => (
                                                <Chip key={index} label={content.courseName} onClick={() => onLessonClick(content.classId)} size="small" />
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

export default MonthView;
