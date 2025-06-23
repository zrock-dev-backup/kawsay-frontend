import { useState } from "react";
import { API_BASE_URL } from "../services/api.helpers";

export interface IngestionResult {
  processedCount: number;
  failedCount: number;
  errors: { csvRow: number; studentId?: number; error: string }[];
  retakeDemand: { courseCode: string; studentCount: number }[];
  advancingCohorts: { cohortName: string; studentCount: number }[];
}

export interface ProposalResult {
  message: string;
  proposalsCreated: number;
}

export function useEndOfModule(timetableId: string) {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [ingestionResult, setIngestionResult] =
    useState<IngestionResult | null>(null);
  const [isPreparingProposals, setIsPreparingProposals] = useState(false);
  const [proposalResult, setProposalResult] = useState<ProposalResult | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const handleIngestionComplete = (result: IngestionResult | null) => {
    setIngestionResult(result);
    setIsImportDialogOpen(false);
  };

  const prepareEnrollments = async (destinationTimetableId: string) => {
    setIsPreparingProposals(true);
    setError(null);
    setProposalResult(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/eom/${timetableId}/prepare-enrollments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ destinationTimetableId }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to prepare enrollment proposals.");
      }
      const data = await response.json();
      setProposalResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred.",
      );
    } finally {
      setIsPreparingProposals(false);
    }
  };

  return {
    state: {
      isImportDialogOpen,
      ingestionResult,
      isPreparingProposals,
      proposalResult,
      error,
    },
    actions: {
      openImportDialog: () => setIsImportDialogOpen(true),
      closeImportDialog: () => setIsImportDialogOpen(false),
      handleIngestionComplete,
      prepareEnrollments,
    },
  };
}
