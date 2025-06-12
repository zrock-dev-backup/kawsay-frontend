import { create } from "zustand";
import type { TimetableStructure } from "../interfaces/apiDataTypes";
import type { Class } from "../interfaces/classDtos";
import {
  fetchClassesForTimetable,
  fetchTimetableStructureById,
  generateScheduleForTimetable,
} from "../services/apiService";

interface TimetableState {
  // Data
  structure: TimetableStructure | null;
  classes: Class[];
  loading: boolean;
  error: string | null;

  // Page UI State
  activeTab: number;
  isGenerating: boolean;
  generateStatus: { type: "success" | "error"; message: string } | null;

  // Actions
  fetchTimetableData: (timetableId: string) => Promise<void>;
  setActiveTab: (tabIndex: number) => void;
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
  isGenerating: false,
  generateStatus: null,

  // Actions
  fetchTimetableData: async (timetableId: string) => {
    set({ loading: true, error: null });
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
