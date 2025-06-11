import {useCallback, useEffect, useMemo, useState} from 'react';
import dayjs from 'dayjs';
import {fetchCourses, fetchTeachers, fetchTimetableStructureById,} from '../../services/apiService.ts';
import type {Course, Teacher, TimetableStructure} from '../../interfaces/apiDataTypes.ts';

export function useClassFormData(timetableId: string | undefined) {
    const [timetableStructure, setTimetableStructure] = useState<TimetableStructure | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);

    const [loadingStructure, setLoadingStructure] = useState<boolean>(true);
    const [loadingCourses, setLoadingCourses] = useState<boolean>(true);
    const [loadingTeachers, setLoadingTeachers] = useState<boolean>(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const fetchData = useCallback(async <T, >(
        fetchFn: () => Promise<T>,
        setData: React.Dispatch<React.SetStateAction<T>>,
        setLoading: React.Dispatch<React.SetStateAction<boolean>>,
        setErrorMsg: string
    ): Promise<boolean> => {
        setLoading(true);
        try {
            const data = await fetchFn();
            setData(data);
            return true;
        } catch (err) {
            console.error(setErrorMsg, err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setFetchError(prev => `${prev ? prev + '; ' : ''}${setErrorMsg}: ${errorMessage}`);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!timetableId) {
            setFetchError('No timetable ID provided in URL.');
            setLoadingStructure(false);
            setLoadingCourses(false);
            setLoadingTeachers(false);
            return;
        }
        setFetchError(null);

        const loadAllData = async () => {
            const structureSuccess = await fetchData(
                () => fetchTimetableStructureById(timetableId),
                setTimetableStructure,
                setLoadingStructure,
                'Failed to load timetable structure'
            );

            if (structureSuccess) {
                await Promise.all([
                    fetchData(fetchCourses, setCourses, setLoadingCourses, 'Failed to load courses'),
                    fetchData(fetchTeachers, setTeachers, setLoadingTeachers, 'Failed to load teachers')
                ]);
            } else {
                setLoadingCourses(false);
                setLoadingTeachers(false);
            }
        };

        loadAllData();
    }, [timetableId, fetchData]);

    const sortedPeriods = useMemo(() => {
        if (!timetableStructure?.periods) return [];
        return [...timetableStructure.periods].sort((a, b) =>
            dayjs(a.start, 'HH:mm').diff(dayjs(b.start, 'HH:mm'))
        );
    }, [timetableStructure?.periods]);

    return {
        timetableStructure,
        courses,
        teachers,
        sortedPeriods,
        loading: loadingStructure || loadingCourses || loadingTeachers,
        fetchError,
    };
}
