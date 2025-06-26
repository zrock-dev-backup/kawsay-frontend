import { useState, useEffect, useCallback, useMemo } from "react";
import type {
  StudentAuditDto,
  AuditStatusFilter,
} from "../interfaces/auditDtos";

import {
  fetchStudentAudit,
  bulkEnroll,
  resolveIssues,
} from "../services/studentAuditApi";

interface UseStudentAuditState {
  students: StudentAuditDto[];
  allStudents: StudentAuditDto[];
  isLoading: boolean;
  isBulkActionLoading: boolean;
  isResolveActionLoading: Record<number, boolean>;
  error: string | null;
  filter: AuditStatusFilter;
  lastFetch: Date | null;
}

interface UseStudentAuditActions {
  setFilter: (filter: AuditStatusFilter) => void;
  confirmBulkEnrollment: (studentIds: number[]) => Promise<void>;
  resolveStudentIssues: (studentId: number) => Promise<void>;
  refetch: () => Promise<void>;
  clearError: () => void;
}

export function useStudentAudit(timetableId: string): {
  state: UseStudentAuditState;
  actions: UseStudentAuditActions;
} {
  const [allStudents, setAllStudents] = useState<StudentAuditDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);
  const [isResolveActionLoading, setIsResolveActionLoading] = useState<
    Record<number, boolean>
  >({});
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<AuditStatusFilter>("All");
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const fetchAuditData = useCallback(async () => {
    if (!timetableId) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchStudentAudit(timetableId);
      setAllStudents(data);
      setLastFetch(new Date());
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch student audit data";
      setError(errorMessage);
      console.error("Student audit fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [timetableId]);

  useEffect(() => {
    fetchAuditData();
  }, [fetchAuditData]);

  const filteredStudents = useMemo(() => {
    if (filter === "All") return allStudents;
    return allStudents.filter((student) => student.status === filter);
  }, [allStudents, filter]);

  const confirmBulkEnrollment = useCallback(
    async (studentIds: number[]) => {
      if (!timetableId || studentIds.length === 0) return;

      setIsBulkActionLoading(true);
      setError(null);

      try {
        await bulkEnroll({ studentIds, timetableId });

        // Optimistic update
        setAllStudents((prev) =>
          prev.map((student) =>
            studentIds.includes(student.studentId)
              ? {
                  ...student,
                  status: "Enrolled" as const,
                  lastUpdated: new Date().toISOString(),
                }
              : student,
          ),
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to confirm bulk enrollment";
        setError(errorMessage);
        throw err;
      } finally {
        setIsBulkActionLoading(false);
      }
    },
    [timetableId],
  );

  const resolveStudentIssues = useCallback(
    async (studentId: number) => {
      setIsResolveActionLoading((prev) => ({ ...prev, [studentId]: true }));
      setError(null);

      try {
        await resolveIssues(studentId);
        await fetchAuditData(); // Refresh to get updated status
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to resolve student issues";
        setError(errorMessage);
        throw err;
      } finally {
        setIsResolveActionLoading((prev) => ({ ...prev, [studentId]: false }));
      }
    },
    [fetchAuditData],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    state: {
      students: filteredStudents,
      allStudents,
      isLoading,
      isBulkActionLoading,
      isResolveActionLoading,
      error,
      filter,
      lastFetch,
    },
    actions: {
      setFilter,
      confirmBulkEnrollment,
      resolveStudentIssues,
      refetch: fetchAuditData,
      clearError,
    },
  };
}
