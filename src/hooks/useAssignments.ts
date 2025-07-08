import { useCallback, useEffect, useState } from "react";
import {
  createAssignment,
  deleteAssignment,
  fetchAssignmentsForTimetable,
} from "../services/academicStructureApi";
import type {
  CreateTimetableAssignmentRequestDto,
  TimetableAssignmentDto,
} from "../interfaces/teacherDtos";

export function useAssignments(timetableId: string | undefined) {
  const [assignments, setAssignments] = useState<TimetableAssignmentDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadAssignments = useCallback(async () => {
    if (!timetableId) {
      setError("No timetable ID provided to fetch assignments.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const fetchedAssignments =
        await fetchAssignmentsForTimetable(timetableId);
      setAssignments(fetchedAssignments);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch assignments.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [timetableId]);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const addAssignment = async (
    data: CreateTimetableAssignmentRequestDto,
  ): Promise<boolean> => {
    if (!timetableId) return false;
    try {
      const newAssignment = await createAssignment(timetableId, data);
      setAssignments((prev) => [...prev, newAssignment]);
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add assignment.",
      );
      return false;
    }
  };

  const removeAssignment = async (assignmentId: number): Promise<boolean> => {
    if (!timetableId) return false;
    const originalAssignments = assignments;
    setAssignments((prev) =>
      prev.filter((a) => a.assignmentId !== assignmentId),
    );
    try {
      await deleteAssignment(timetableId, assignmentId);
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to remove assignment.",
      );
      setAssignments(originalAssignments); // Revert on failure
      return false;
    }
  };

  return {
    assignments,
    isAssignmentsLoading: isLoading,
    assignmentsError: error,
    addAssignment,
    removeAssignment,
    reloadAssignments: loadAssignments,
  };
}
