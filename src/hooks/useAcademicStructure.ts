import { useState, useEffect, useCallback } from 'react';
import type { CohortDetailDto } from '../interfaces/academicStructureDtos';

export function useAcademicStructure(timetableId: string | undefined) {
    const [cohorts, setCohorts] = useState<CohortDetailDto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // TODO: update to use GET /timetables/{id}/cohorts
    const fetchCohortsForTimetable = useCallback(async () => {
        if (!timetableId) {
            setError("No timetable ID provided to fetch cohorts.");
            setLoading(false);
            return;
        }
        
        setLoading(true);
        setError(null);
        try {
            console.warn("`fetchCohortsForTimetable` was called, but no backend endpoint exists to fetch all cohorts for a timetable. The hook will manage state, but cannot pre-populate.");
            setCohorts([]); // Start with empty state
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to fetch cohorts.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [timetableId]);

    useEffect(() => {
        setLoading(false);
    }, [timetableId]);

    const addCohort = (newCohort: CohortDetailDto) => {
        setCohorts(prevCohorts => [...prevCohorts, newCohort]);
    };
    
    return {
        cohorts,
        loading,
        error,
        addCohort,
        fetchCohorts: fetchCohortsForTimetable,
    };
}
