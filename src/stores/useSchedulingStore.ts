import { create } from "zustand";
import type {
  StagedPlacementDto,
  ValidSlotDto,
} from "../interfaces/schedulingDtos.ts";
import {
  createStagedPlacement,
  deleteStagedPlacement,
  fetchValidSlots,
  finalizeSchedule as apiFinalizeSchedule,
} from "../services/schedulingApi.ts";

interface SchedulingState {
  stagedPlacements: StagedPlacementDto[];
  validSlots: ValidSlotDto[];
  selectedRequirementId: number | null;
  isLoading: boolean;
  isFinalizing: boolean;
  error: string | null;
  lastFinalizationResult: { message: string; classesCreated: number } | null;

  selectRequirement: (id: number | null) => Promise<void>;
  stagePlacement: (dayId: number, startPeriodId: number) => Promise<void>;
  unstagePlacement: (placementId: number) => Promise<void>;
  finalizeSchedule: (timetableId: number) => Promise<boolean>;
  reset: () => void;
  clearFinalizationResult: () => void;
}

export const useSchedulingStore = create<SchedulingState>((set, get) => ({
  stagedPlacements: [],
  validSlots: [],
  selectedRequirementId: null,
  isLoading: false,
  isFinalizing: false,
  error: null,
  lastFinalizationResult: null,

  selectRequirement: async (id: number | null) => {
    if (get().selectedRequirementId === id) {
      set({ selectedRequirementId: null, validSlots: [] });
      return;
    }
    if (id === null) {
      set({ selectedRequirementId: null, validSlots: [] });
      return;
    }
    set({
      isLoading: true,
      selectedRequirementId: id,
      validSlots: [],
      error: null,
    });
    try {
      const slots = await fetchValidSlots(id);
      set({ validSlots: slots, isLoading: false });
    } catch (err) {
      set({ error: "Failed to fetch valid slots.", isLoading: false });
      console.error(err);
    }
  },

  stagePlacement: async (dayId: number, startPeriodId: number) => {
    const requirementId = get().selectedRequirementId;
    if (!requirementId) return;

    set({ isLoading: true });
    try {
      const newPlacement = await createStagedPlacement({
        requirementId,
        dayId,
        startPeriodId,
      });
      set((state) => ({
        stagedPlacements: [...state.stagedPlacements, newPlacement],
        selectedRequirementId: null,
        validSlots: [],
        isLoading: false,
      }));
    } catch (err) {
      set({ error: "Failed to stage placement.", isLoading: false });
      console.error(err);
    }
  },

  unstagePlacement: async (placementId: number) => {
    const placement = get().stagedPlacements.find((p) => p.id === placementId);
    if (!placement) return;

    set({ isLoading: true });
    try {
      await deleteStagedPlacement(placementId);
      set((state) => ({
        stagedPlacements: state.stagedPlacements.filter(
          (p) => p.id !== placementId,
        ),
        isLoading: false,
      }));
      await get().selectRequirement(placement.courseRequirementId);
    } catch (err) {
      set({ error: "Failed to unstage placement.", isLoading: false });
      console.error(err);
    }
  },

  finalizeSchedule: async (timetableId: number) => {
    set({ isFinalizing: true, error: null, lastFinalizationResult: null });
    try {
      const result = await apiFinalizeSchedule(timetableId);
      set({
        isFinalizing: false,
        stagedPlacements: [],
        validSlots: [],
        selectedRequirementId: null,
        lastFinalizationResult: result,
      });
      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Finalization failed.";
      set({ error: message, isFinalizing: false });
      return false;
    }
  },

  reset: () =>
    set({
      stagedPlacements: [],
      validSlots: [],
      selectedRequirementId: null,
      isLoading: false,
      isFinalizing: false,
      error: null,
      lastFinalizationResult: null,
    }),

  clearFinalizationResult: () => set({ lastFinalizationResult: null }),
}));
