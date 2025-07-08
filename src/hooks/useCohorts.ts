import { useCallback, useEffect, useState } from "react";
import type { CohortDetailDto } from "../interfaces/academicStructureDtos";
import {
  createCohort,
  createSection,
  createStudentGroup,
  fetchCohortsForTimetable,
} from "../services/academicStructureApi";

export function useCohorts(timetableId: string | undefined) {
  const [cohorts, setCohorts] = useState<CohortDetailDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadCohorts = useCallback(async () => {
    if (!timetableId) {
      setError("No timetable ID provided to fetch cohorts.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const fetchedCohorts = await fetchCohortsForTimetable(timetableId);
      setCohorts(fetchedCohorts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch cohorts.");
    } finally {
      setIsLoading(false);
    }
  }, [timetableId]);

  useEffect(() => {
    loadCohorts();
  }, [loadCohorts]);

  const addCohort = async (
    cohortName: string,
  ): Promise<CohortDetailDto | null> => {
    if (!timetableId) return null;
    const newCohort = await createCohort({
      name: cohortName,
      timetableId: Number(timetableId),
    });
    setCohorts((prev) => [...prev, newCohort]);
    return newCohort;
  };

  const addStudentGroup = async (
    cohortId: number,
    groupName: string,
  ): Promise<void> => {
    if (!timetableId) return;
    const newGroup = await createStudentGroup({ name: groupName, cohortId });
    setCohorts((prev) =>
      prev.map((c) =>
        c.id === cohortId
          ? { ...c, studentGroups: [...c.studentGroups, newGroup] }
          : c,
      ),
    );
  };

  const addSection = async (
    cohortId: number,
    groupId: number,
    sectionName: string,
  ): Promise<void> => {
    if (!timetableId) return;
    const newSection = await createSection({
      name: sectionName,
      studentGroupId: groupId,
    });
    setCohorts((prev) =>
      prev.map((c) => {
        if (c.id !== cohortId) return c;
        return {
          ...c,
          studentGroups: c.studentGroups.map((g) =>
            g.id === groupId
              ? { ...g, sections: [...g.sections, newSection] }
              : g,
          ),
        };
      }),
    );
  };

  return {
    cohorts,
    isCohortsLoading: isLoading,
    cohortsError: error,
    addCohort,
    addStudentGroup,
    addSection,
    reloadCohorts: loadCohorts,
  };
}
