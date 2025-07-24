import { create } from "zustand";
import type {
  TeacherDto,
  CreateTeacherRequestDto,
  UpdateTeacherRequestDto,
} from "../interfaces/teacherDtos";
import {
  createTeacher,
  deleteTeacher,
  fetchTeachers,
  updateTeacher as apiUpdateTeacher,
} from "../services/facultyApi";

interface FacultyState {
  teachers: TeacherDto[];
  isLoading: boolean;
  error: string | null;
  fetchTeachers: () => Promise<void>;
  addTeacher: (data: CreateTeacherRequestDto) => Promise<boolean>;
  updateTeacher: (
    id: number,
    data: UpdateTeacherRequestDto,
  ) => Promise<boolean>;
  /** Deactivates a teacher's profile (soft delete). */
  removeTeacher: (id: number) => Promise<boolean>;
}

export const useFacultyStore = create<FacultyState>((set, get) => ({
  teachers: [],
  isLoading: false,
  error: null,

  fetchTeachers: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchTeachers();
      set({ teachers: data, isLoading: false });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch teachers.";
      set({ error: message, isLoading: false });
    }
  },

  addTeacher: async (data: CreateTeacherRequestDto) => {
    set({ isLoading: true });
    try {
      const newTeacher = await createTeacher(data);
      set((state) => ({
        teachers: [...state.teachers, newTeacher],
        isLoading: false,
      }));
      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create teacher.";
      set({ error: message, isLoading: false });
      return false;
    }
  },

  updateTeacher: async (id: number, data: UpdateTeacherRequestDto) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTeacherFromServer = await apiUpdateTeacher(id, data);

      set((state) => ({
        teachers: state.teachers.map((t) =>
          t.id === id ? updatedTeacherFromServer : t,
        ),
        isLoading: false,
      }));
      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update teacher.";
      set({ error: message, isLoading: false });
      // Do not revert state on failure, as the server might have failed
      // for reasons other than bad data. The user can retry.
      return false;
    }
  },

  removeTeacher: async (id: number) => {
    // TODO: For a soft delete, we can perform an optimistic update for a faster UI response.
    const originalTeachers = get().teachers;
    // TODO: We assume the API call will succeed and filter the teacher out of the active list.
    // In a real app, we might move them to an "inactive" list instead.
    set((state) => ({
      teachers: state.teachers.map((t) =>
        t.id === id ? { ...t, isActive: false } : t,
      ),
    }));

    try {
      await deleteTeacher(id);
      // TODO: On success, we can trigger a refetch to ensure consistency, or just leave the optimistic update.
      // For now, the optimistic update is sufficient.
      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to deactivate teacher.";
      // On failure, revert the optimistic update and set an error.
      set({ error: message, teachers: originalTeachers });
      return false;
    }
  },
}));
