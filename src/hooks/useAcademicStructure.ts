import { useState, useEffect, useCallback } from 'react';
import type { CohortDetailDto } from '../interfaces/academicStructureDtos';
import { fetchCohortsForTimetable, createCohort,  createStudentGroup} from '../services/academicStructureApi';

export function useAcademicStructure(timetableId: string | undefined) {
    const [cohorts, setCohorts] = useState<CohortDetailDto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const loadCohorts = useCallback(async () => {
        if (!timetableId) {
            setError("No timetable ID provided to fetch cohorts.");
            setLoading(false);
            return;
        }
        
        setLoading(true);
        setError(null);
        try {
            const fetchedCohorts = await fetchCohortsForTimetable(timetableId);
            setCohorts(fetchedCohorts);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to fetch cohorts.";
            // handle timetable with no cohorts
            if (errorMessage.includes("404") || errorMessage.toLowerCase().includes("not found")) {
                console.warn(`No cohorts found for timetable ${timetableId}. This may be expected.`);
                setCohorts([]);
            } else {
                setError(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    }, [timetableId]);

    useEffect(() => {
        loadCohorts();
    }, [loadCohorts]);

    const addCohort = async (cohortName: string): Promise<CohortDetailDto | null> => {
        if (!timetableId) {
            setError("Cannot create cohort without a timetable ID.");
            return null;
        }
        try {
            const newCohort = await createCohort({ name: cohortName, timetableId: Number(timetableId) });
            setCohorts(prevCohorts => [...prevCohorts, newCohort]);
            return newCohort;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to create cohort.";
            setError(errorMessage);
            return null;
        }
    };

    const addStudentGroup = async (cohortId: number, groupName: string): Promise<StudentGroupDetailDto | null> => {
        if (!timetableId) {
            setError("Cannot create group without a timetable ID.");
            return null;
        }
        try {
            const newGroup = await createStudentGroup({ name: groupName, cohortId });
            setCohorts(prevCohorts =>
                prevCohorts.map(cohort =>
                    cohort.id === cohortId
                        ? { ...cohort, studentGroups: [...cohort.studentGroups, newGroup] }
                        : cohort
                )
            );
            console.log(newGroup);
            return newGroup;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to create student group.";
            setError(errorMessage);
            return null;
        }
    };
    
    return {
        cohorts,
        loading,
        error,
        addCohort,
        reloadCohorts: loadCohorts,
        addStudentGroup,
    };
}
