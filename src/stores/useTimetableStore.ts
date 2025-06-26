import { create } from "zustand";
import type { Class } from "../interfaces/classDtos";
import {
  fetchClassesForTimetable,
  fetchTimetableStructureById,
  generateScheduleForTimetable,
} from "../services/apiService";
import type { TimetableStructure } from "../interfaces/timetableDtos.ts";

interface TimetableState {
  // Data
  structure: TimetableStructure | null;
  classes: Class[];
  loading: boolean;
  error: string | null;

  // Page UI State
  activeTab: number;
  wizardStep: number;
  isGenerating: boolean;
  generateStatus: { type: "success" | "error"; message: string } | null;

  // Actions
  fetchTimetableData: (timetableId: string) => Promise<void>;
  setActiveTab: (tabIndex: number) => void;
  setWizardStep: (step: number) => void;
  goToNextWizardStep: () => void;
  generateSchedule: (timetableId: string) => Promise<void>;
  clearGenerateStatus: () => void;
  refreshData: () => void;
}

export const useTimetableStore = create<TimetableState>((set, get) => ({
  // Initial State
  structure: null,
  classes: [],
  loading: true,
  error: null,
  activeTab: 0,
  wizardStep: 0,
  isGenerating: false,
  generateStatus: null,

  // Actions
  fetchTimetableData: async (timetableId: string) => {
    set({ loading: true, error: null, wizardStep: 0 }); // Reset wizard on fetch
    try {
      const [structureData, classesData] = await Promise.all([
        fetchTimetableStructureById(timetableId),
        fetchClassesForTimetable(timetableId),
      ]);
      set({ structure: structureData, classes: classesData, loading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to load data",
        loading: false,
      });
    }
  },
  setActiveTab: (tabIndex: number) => set({ activeTab: tabIndex }),
  setWizardStep: (step: number) => set({ wizardStep: step }),
  goToNextWizardStep: () =>
    set((state) => ({ wizardStep: state.wizardStep + 1 })),
  generateSchedule: async (timetableId: string) => {
    set({ isGenerating: true, generateStatus: null });
    try {
      const result = await generateScheduleForTimetable(timetableId);
      set({
        generateStatus: { type: "success", message: result.message },
        isGenerating: false,
      });
      get().refreshData(); // Refresh data on success
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred.";
      set({
        generateStatus: {
          type: "error",
          message: `Generation Error: ${errorMessage}`,
        },
        isGenerating: false,
      });
    }
  },
  clearGenerateStatus: () => set({ generateStatus: null }),
  refreshData: () => {
    const id = get().structure?.id;
    if (id) {
      get().fetchTimetableData(id.toString());
    }
  },
}));
