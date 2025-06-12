import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
// CORRECTED: The service functions now live in their own files
import {
  fetchClassesForTimetable,
  fetchTimetableStructureById,
} from "../../services/apiService.ts";
import type { Class } from "../../interfaces/classDtos.ts";
import type { TimetableStructure } from "../../interfaces/apiDataTypes.ts";

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
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  useEffect(() => {
    if (!timetableId) {
      setError("No Timetable ID provided.");
      setLoading(false);
      return;
    }
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [structureData, classesData] = await Promise.all([
          fetchTimetableStructureById(timetableId),
          fetchClassesForTimetable(timetableId),
        ]);
        setStructure(structureData);
        setClasses(classesData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load timetable data.",
        );
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [timetableId, refreshKey]);

  const scheduleMap = useMemo(() => {
    const map: ProcessedScheduleMap = new Map();
    if (!structure) return map;

    classes.forEach((cls) => {
      cls.classOccurrences.forEach((occ) => {
        const key = `${occ.date}_${occ.startPeriodId}`;
        if (!map.has(key)) {
          map.set(key, []);
        }
        // CORRECTED: Using the new flat properties from the Class DTO
        map.get(key)!.push({
          classId: cls.id,
          courseName: cls.courseName,
          courseCode: cls.courseCode,
          teacherName: cls.teacherName,
          length: cls.length,
        });
      });
    });
    return map;
  }, [classes, structure]);

  const sortedPeriods = useMemo(() => {
    if (!structure?.periods) return [];
    return [...structure.periods].sort((a, b) =>
      dayjs(a.start, "HH:mm").diff(dayjs(b.start, "HH:mm")),
    );
  }, [structure?.periods]);

  const refreshData = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return {
    structure,
    classes,
    loading,
    error,
    scheduleMap,
    sortedPeriods,
    refreshData,
  };
}
