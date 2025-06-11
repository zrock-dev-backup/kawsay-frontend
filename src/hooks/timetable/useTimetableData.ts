import {useEffect, useMemo, useState} from 'react';
import dayjs from 'dayjs';
import {fetchClassesForTimetable, fetchTimetableStructureById} from '../../services/apiService.ts';
import type {Class as ApiClass, TimetableStructure} from '../../interfaces/apiDataTypes.ts';

interface GridCellContent {
    classId: number;
    courseName: string;
    courseCode: string;
    teacherName: string | null;
    length: number;
}

type ProcessedScheduleMap = Map<string, GridCellContent[]>;

export function useTimetableData(timetableId: string | undefined) {
    const [structure, setStructure] = useState<TimetableStructure | null>(null);
    const [classes, setClasses] = useState<ApiClass[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState<number>(0);

    useEffect(() => {
        if (!timetableId) {
            setError('No Timetable ID provided.');
            setLoading(false);
            return;
        }
        const loadData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [structureData, classesData] = await Promise.all([
                    fetchTimetableStructureById(timetableId),
                    fetchClassesForTimetable(timetableId)
                ]);
                setStructure(structureData);
                setClasses(classesData);
            } catch (err) {
                console.error(`Error fetching data for timetable ID ${timetableId}:`, err);
                setError(err instanceof Error ? err.message : 'Failed to load timetable data.');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [timetableId, refreshKey]);

    const scheduleMap = useMemo(() => {
        const map: ProcessedScheduleMap = new Map();
        if (!structure) return map;

        classes.forEach(cls => {
            cls.classOccurrences.forEach(occ => {
                const key = `${occ.date}_${occ.startPeriodId}`;
                if (!map.has(key)) {
                    map.set(key, []);
                }
                map.get(key)!.push({
                    classId: cls.id,
                    courseName: cls.courseDto.name,
                    courseCode: cls.courseDto.code, // Added courseCode
                    teacherName: cls.teacherDto?.name ?? null,
                    length: cls.length,
                });
            });
        });
        return map;
    }, [classes, structure]);

    const sortedPeriods = useMemo(() => {
        if (!structure?.periods) return [];
        return [...structure.periods].sort((a, b) =>
            dayjs(a.start, 'HH:mm').diff(dayjs(b.start, 'HH:mm'))
        );
    }, [structure?.periods]);

    const refreshData = () => {
        setRefreshKey(prev => prev + 1);
    };

    return {structure, classes, loading, error, scheduleMap, sortedPeriods, refreshData};
}
