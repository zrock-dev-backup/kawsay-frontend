import { create } from "zustand";
import type {
  CourseRequirementDto,
  CreateCourseRequirementRequest,
} from "../interfaces/courseRequirementDtos.ts";
import {
  createRequirement,
  fetchRequirements,
} from "../services/courseRequirementApi.ts";

interface CourseRequirementState {
  requirements: CourseRequirementDto[];
  isLoading: boolean;
  error: string | null;
  fetchRequirements: (timetableId: number) => Promise<void>;
  addRequirement: (data: CreateCourseRequirementRequest) => Promise<boolean>;
}

export const useCourseRequirementStore = create<CourseRequirementState>(
  (set, get) => ({
    requirements: [],
    isLoading: false,
    error: null,

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
        return true; // Success
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create requirement.";
        set({ error: message, isLoading: false });
        return false; // Failure
      }
    },
  }),
);
