import {useState, useCallback} from 'react';
import dayjs, {Dayjs} from 'dayjs';
import {View} from 'react-big-calendar';

export function useCalendarControls(initialDate?: Dayjs) {
    const [view, setView] = useState<View>('week');
    const [displayDate, setDisplayDate] = useState(() => initialDate || dayjs());

    const handleViewChange = useCallback((newView: View) => {
        if (newView) setView(newView);
    }, []);

    const handleNavigate = useCallback((newDate: Date) => {
        setDisplayDate(dayjs(newDate));
    }, []);

    const handlePrev = useCallback(() => {
        const newDate = displayDate.subtract(1, view === 'month' ? 'month' : 'week').toDate();
        handleNavigate(newDate);
    }, [view, displayDate, handleNavigate]);

    const handleNext = useCallback(() => {
        const newDate = displayDate.add(1, view === 'month' ? 'month' : 'week').toDate();
        handleNavigate(newDate);
    }, [view, displayDate, handleNavigate]);

    const handleToday = useCallback(() => {
        handleNavigate(new Date());
    }, [handleNavigate]);

    return {
        view,
        displayDate,
        handleViewChange,
        handleNavigate,
        handlePrev,
        handleNext,
        handleToday,
    };
}
