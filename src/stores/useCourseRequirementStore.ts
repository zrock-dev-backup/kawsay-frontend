import { create } from "zustand";
import type {
  CourseRequirementDto,
  CreateCourseRequirementRequest,
} from "../interfaces/courseRequirementDtos.ts";
import {
  createRequirement,
  fetchRequirements,
  updateRequirement,
  deleteRequirement,
  fetchRequirementById,
  runPreflightCheck,
  bulkCreateRequirements,
} from "../services/courseRequirementsApi.ts";
import {
  BulkImportResultDto,
  BulkRequirementRequestItem,
} from "../interfaces/bulkImportDtos.ts";

const POLLING_INTERVAL = 3000;
const POLLING_TIMEOUT = 60000; // 1 minute

interface CourseRequirementState {
  requirements: CourseRequirementDto[];
  isLoading: boolean;
  error: string | null;
  checkingIds: Set<number>;

  isBulkImporting: boolean;
  bulkImportError: string | null;

  fetchRequirements: (timetableId: number) => Promise<void>;
  addRequirement: (data: CreateCourseRequirementRequest) => Promise<boolean>;
  updateRequirement: (
    id: number,
    data: Partial<CreateCourseRequirementRequest>,
  ) => Promise<boolean>;
  deleteRequirement: (id: number) => Promise<boolean>;
  runPreflightCheck: (id: number) => Promise<void>;
  bulkAddRequirements: (
    data: BulkRequirementRequestItem[],
  ) => Promise<BulkImportResultDto | null>;
}

export const useCourseRequirementStore = create<CourseRequirementState>(
  (set, get) => ({
    requirements: [],
    isLoading: false,
    error: null,
    checkingIds: new Set(),
    isBulkImporting: false,
    bulkImportError: null,

    fetchRequirements: async (timetableId: number) => {
      set({ isLoading: true, error: null });
      try {
        const data = await fetchRequirements(timetableId);
        set({ requirements: data, isLoading: false });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch requirements.";
        set({ error: message, isLoading: false });
      }
    },

    addRequirement: async (data: CreateCourseRequirementRequest) => {
      set({ isLoading: true });
      try {
        const newRequirement = await createRequirement(data);
        set((state) => ({
          requirements: [...state.requirements, newRequirement],
          isLoading: false,
        }));
        await get().runPreflightCheck(newRequirement.id);
        return true; // Success
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create requirement.";
        set({ error: message, isLoading: false });
        return false; // Failure
      }
    },

    runPreflightCheck: async (id: number) => {
      if (get().checkingIds.has(id)) return;
      set((state) => ({ checkingIds: new Set(state.checkingIds).add(id) }));

      try {
        await runPreflightCheck(id);
        const poll = setInterval(async () => {
          const req = await fetchRequirementById(id);
          if (req.eligibilitySummary) {
            clearInterval(poll);
            set((state) => {
              const newCheckingIds = new Set(state.checkingIds);
              newCheckingIds.delete(id);
              return {
                requirements: state.requirements.map((r) =>
                  r.id === id ? req : r,
                ),
                checkingIds: newCheckingIds,
              };
            });
          }
        }, POLLING_INTERVAL);

        setTimeout(() => {
          clearInterval(poll);
          set((state) => {
            const newCheckingIds = new Set(state.checkingIds);
            newCheckingIds.delete(id);
            return { checkingIds: newCheckingIds };
          });
        }, POLLING_TIMEOUT);
      } catch (err) {
        console.error(
          `Failed to start pre-flight check for requirement ${id}`,
          err,
        );
        set((state) => {
          const newCheckingIds = new Set(state.checkingIds);
          newCheckingIds.delete(id);
          return { checkingIds: newCheckingIds };
        });
      }
    },

    updateRequirement: async (
      id: number,
      data: Partial<CreateCourseRequirementRequest>,
    ) => {
      set({ isLoading: true });
      try {
        const updatedRequirement = await updateRequirement(id, data);
        set((state) => ({
          requirements: state.requirements.map((req) =>
            req.id === id ? updatedRequirement : req,
          ),
          isLoading: false,
        }));

        await get().runPreflightCheck(updatedRequirement.id);
        return true; // Success
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update requirement.";
        set({ error: message, isLoading: false });
        return false; // Failure
      }
    },

    deleteRequirement: async (id: number) => {
      set((state) => ({
        requirements: state.requirements.filter((req) => req.id !== id),
      }));

      try {
        await deleteRequirement(id);
        return true; // Success
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to delete requirement.";
        set({ error: message });
        // re-inserting requirement
        await get().fetchRequirements(get().requirements[0]?.timetableId); // Simple refresh on error
        return false; // Failure
      }
    },
    bulkAddRequirements: async (data: BulkRequirementRequestItem[]) => {
      set({ isBulkImporting: true, bulkImportError: null });
      try {
        const result = await bulkCreateRequirements(data);

        if (
          result.createdRequirements &&
          result.createdRequirements.length > 0
        ) {
          set((state) => ({
            requirements: [
              ...state.requirements,
              ...result.createdRequirements,
            ],
          }));
          // Optional: Trigger pre-flight checks for all newly created requirements
          result.createdRequirements.forEach((req) => {
            get().runPreflightCheck(req.id);
          });
        }

        set({ isBulkImporting: false });
        return result;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "An unknown error occurred during bulk import.";
        set({ bulkImportError: message, isBulkImporting: false });
        return null;
      }
    },
  }),
);
