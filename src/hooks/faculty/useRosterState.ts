import { useState, useEffect, useCallback, useMemo } from "react";
import type { TeacherDto } from "../../interfaces/teacherDtos";
import type { TimetableStructure } from "../../interfaces/timetableDtos";
import { useFacultyStore } from "../../stores/useFacultyStore";
import {
  fetchAllTimetables,
  fetchMasterTimetable,
} from "../../services/timetableApi";

export const useRosterState = () => {
  const {
    teachers,
    isLoading: isFacultyLoading,
    updateTeacher,
  } = useFacultyStore();

  const [allTimetables, setAllTimetables] = useState<TimetableStructure[]>([]);
  const [masterTimetable, setMasterTimetable] =
    useState<TimetableStructure | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 'global' context means we are editing default availability.
  // A number means we are editing overrides for that timetable ID.
  const [activeContextId, setActiveContextId] = useState<string>("global");

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [timetables, master] = await Promise.all([
          fetchAllTimetables(),
          fetchMasterTimetable(),
        ]);
        setAllTimetables(timetables);
        setMasterTimetable(master);
      } catch (error) {
        console.error("Failed to load roster context:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const activeTimetable = useMemo(() => {
    if (activeContextId === "global") return null;
    return (
      allTimetables.find((tt) => tt.id.toString() === activeContextId) || null
    );
  }, [activeContextId, allTimetables]);

  const handleSaveAvailability = useCallback(
    async (teacherId: number, updatedTeacherData: Partial<TeacherDto>) => {
      await updateTeacher(teacherId, updatedTeacherData);
    },
    [updateTeacher],
  );

  const overallLoading = isFacultyLoading || isLoading;

  return {
    teachers,
    allTimetables,
    masterTimetable,
    activeTimetable,
    activeContextId,
    isLoading: overallLoading,
    setActiveContextId,
    handleSaveAvailability,
  };
};
