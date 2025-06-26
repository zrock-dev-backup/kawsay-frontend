// src/hooks/useRequirementIssues.ts

import { useEffect, useState } from "react";
import { fetchRequirementIssues } from "../services/courseRequirementsApi.ts";
import type { RequirementIssueDto } from "../interfaces/auditDtos";

export function useRequirementIssues(requirementId: number | null) {
  const [issues, setIssues] = useState<RequirementIssueDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!requirementId) {
      setIssues([]);
      return;
    }

    const loadIssues = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchRequirementIssues(requirementId);
        setIssues(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadIssues();
  }, [requirementId]);

  return { issues, isLoading, error };
}
