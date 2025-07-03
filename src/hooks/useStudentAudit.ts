import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  AuditStatusFilter,
  StudentAuditDto,
} from "../interfaces/auditDtos";
import type {
  ResolveIssueRequestDto,
  StudentIssueDetailDto,
} from "../interfaces/issueDtos";
import {
  bulkEnroll,
  fetchStudentAudit,
  fetchStudentIssues,
  resolveStudentIssue,
} from "../services/studentAuditApi";

export interface UseStudentAuditState {
  students: StudentAuditDto[];
  allStudents: StudentAuditDto[];
  isLoading: boolean;
  isBulkActionLoading: boolean;
  filter: AuditStatusFilter;
  lastFetch: Date | null;
  error: string | null;
  isResolutionModalOpen: boolean;
  studentForResolution: StudentAuditDto | null;
  issueDetails: StudentIssueDetailDto[];
  isSubmittingResolution: boolean;
  resolutionError: string | null;
  resolvingStudentId: number | null;
}

export interface UseStudentAuditActions {
  setFilter: (filter: AuditStatusFilter) => void;
  confirmBulkEnrollment: (studentIds: number[]) => Promise<void>;
  refetch: () => Promise<void>;
  clearError: () => void;
  openResolutionModal: (studentId: number) => Promise<void>;
  closeResolutionModal: () => void;
  submitResolution: (payload: ResolveIssueRequestDto) => Promise<boolean>;
}

const initialState: Omit<UseStudentAuditState, "students"> = {
  allStudents: [],
  isLoading: true,
  isBulkActionLoading: false,
  error: null,
  filter: "All",
  lastFetch: null,
  isResolutionModalOpen: false,
  studentForResolution: null,
  issueDetails: [],
  isSubmittingResolution: false,
  resolutionError: null,
  resolvingStudentId: null,
};

export function useStudentAudit(timetableId: string): {
  state: UseStudentAuditState;
  actions: UseStudentAuditActions;
} {
  const [state, setState] = useState(initialState);

  const setAuditState = (newState: Partial<typeof state>) => {
    setState((prev) => ({ ...prev, ...newState }));
  };

  const fetchAuditData = useCallback(async () => {
    if (!timetableId) return;
    setAuditState({ isLoading: true, error: null });
    try {
      const data = await fetchStudentAudit(timetableId);
      setAuditState({
        allStudents: data,
        lastFetch: new Date(),
        isLoading: false,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch student audit data";
      setAuditState({ error: errorMessage, isLoading: false });
    }
  }, [timetableId]);

  useEffect(() => {
    fetchAuditData();
  }, [fetchAuditData]);

  const filteredStudents = useMemo(() => {
    if (state.filter === "All") return state.allStudents;
    return state.allStudents.filter(
      (student) => student.status === state.filter,
    );
  }, [state.allStudents, state.filter]);

  const confirmBulkEnrollment = useCallback(
    async (studentIds: number[]) => {
      if (!timetableId || studentIds.length === 0) return;
      setAuditState({ isBulkActionLoading: true, error: null });
      try {
        await bulkEnroll({ studentIds, timetableId });
        await fetchAuditData();
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to confirm bulk enrollment";
        setAuditState({ error: errorMessage });
        throw err;
      } finally {
        setAuditState({ isBulkActionLoading: false });
      }
    },
    [timetableId, fetchAuditData],
  );

  const clearError = useCallback(
    () => setAuditState({ error: null, resolutionError: null }),
    [],
  );

  const setFilter = (newFilter: AuditStatusFilter) =>
    setAuditState({ filter: newFilter });

  const openResolutionModal = useCallback(
    async (studentId: number) => {
      const student = state.allStudents.find((s) => s.studentId === studentId);
      if (!student) return;

      setAuditState({
        resolvingStudentId: studentId,
        resolutionError: null,
        studentForResolution: student,
      });

      try {
        const issues = await fetchStudentIssues(studentId);
        setAuditState({
          issueDetails: issues,
          isResolutionModalOpen: true,
          resolvingStudentId: null,
        });
      } catch (err) {
        setAuditState({
          resolutionError:
            err instanceof Error
              ? err.message
              : "Failed to load issue details.",
          studentForResolution: null,
          resolvingStudentId: null,
        });
      }
    },
    [state.allStudents],
  );

  const closeResolutionModal = useCallback(() => {
    setAuditState({
      isResolutionModalOpen: false,
      studentForResolution: null,
      issueDetails: [],
      isSubmittingResolution: false,
      resolutionError: null,
    });
  }, []);

  const submitResolution = useCallback(
    async (payload: ResolveIssueRequestDto): Promise<boolean> => {
      const studentId = state.studentForResolution?.studentId;
      if (!studentId) return false;

      setAuditState({ isSubmittingResolution: true, resolutionError: null });

      try {
        await resolveStudentIssue(studentId, payload);
        await fetchAuditData();
        closeResolutionModal();
        return true;
      } catch (err) {
        setAuditState({
          resolutionError:
            err instanceof Error ? err.message : "Failed to resolve issue.",
          isSubmittingResolution: false,
        });
        return false;
      }
    },
    [state.studentForResolution, fetchAuditData, closeResolutionModal],
  );

  return {
    state: {
      ...state,
      students: filteredStudents,
    },
    actions: {
      setFilter,
      confirmBulkEnrollment,
      refetch: fetchAuditData,
      clearError,
      openResolutionModal,
      closeResolutionModal,
      submitResolution,
    },
  };
}
