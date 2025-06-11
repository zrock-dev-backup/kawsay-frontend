import {useCallback, useState} from 'react';
import dayjs, {Dayjs} from 'dayjs';

export function useCalendarControls(initialDate?: Dayjs) {
    const [view, setView] = useState<'week' | 'month'>('week');
    const [displayDate, setDisplayDate] = useState(() => initialDate || dayjs());

    const handleViewChange = useCallback((
        event: React.MouseEvent<HTMLElement>,
        newView: 'week' | 'month' | null
    ) => {
        if (newView !== null) {
            setView(newView);
        }
    }, []);

    const handlePrev = useCallback(() => {
        setDisplayDate(prev => prev.subtract(1, view));
    }, [view]);

    const handleNext = useCallback(() => {
        setDisplayDate(prev => prev.add(1, view));
    }, [view]);

    const handleToday = useCallback(() => {
        setDisplayDate(dayjs());
    }, []);

    return {
        view,
        displayDate,
        handleViewChange,
        handlePrev,
        handleNext,
        handleToday
    };
}
