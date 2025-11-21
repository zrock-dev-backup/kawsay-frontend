import { useCallback, useState } from "react";
import type {
  EnrollmentProposalResultDto,
  GradeSyncReportDto,
} from "../interfaces/eomDtos";
import {
  prepareEnrollmentProposals,
  syncGradesFromSource as syncGradesFromSourceApi,
} from "../services/eomApi";

export function useEndOfModule(timetableId: string) {
  const [isSyncingGrades, setIsSyncingGrades] = useState(false);
  const [ingestionResult, setIngestionResult] =
    useState<GradeSyncReportDto | null>(null);
  const [isPreparingProposals, setIsPreparingProposals] = useState(false);
  const [proposalResult, setProposalResult] =
    useState<EnrollmentProposalResultDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  const syncGradesFromSource = useCallback(async () => {
    if (!timetableId) {
      setError("Timetable ID is required to sync grades.");
      return;
    }
    setIsSyncingGrades(true);
    setError(null);
    try {
      const result = await syncGradesFromSourceApi(timetableId);
      setIngestionResult(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while syncing grades.",
      );
    } finally {
      setIsSyncingGrades(false);
    }
  }, [timetableId]);

  const prepareEnrollments = useCallback(
    async (destinationTimetableId: string) => {
      if (!timetableId) {
        setError("Timetable ID is required to prepare enrollments.");
        return;
      }

      setIsPreparingProposals(true);
      setError(null);
      setProposalResult(null);

      try {
        const data = await prepareEnrollmentProposals(
          timetableId,
          destinationTimetableId,
        );
        setProposalResult(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred.",
        );
      } finally {
        setIsPreparingProposals(false);
      }
    },
    [timetableId],
  );

  return {
    state: {
      isSyncingGrades,
      ingestionResult,
      isPreparingProposals,
      proposalResult,
      error,
    },
    actions: {
      syncGradesFromSource,
      prepareEnrollments,
    },
  };
}
