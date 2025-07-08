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
  updateTeacher,
} from "../services/facultyApi";

interface FacultyState {
  teachers: TeacherDto[];
  isLoading: boolean;
  error: string | null;
  fetchTeachers: () => Promise<void>;
  addTeacher: (data: CreateTeacherRequestDto) => Promise<boolean>;
  editTeacher: (id: number, data: UpdateTeacherRequestDto) => Promise<boolean>;
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

  editTeacher: async (id: number, data: UpdateTeacherRequestDto) => {
    set({ isLoading: true });
    try {
      const updatedTeacher = await updateTeacher(id, data);
      set((state) => ({
        teachers: state.teachers.map((t) =>
          t.id === id ? updatedTeacher : t,
        ),
        isLoading: false,
      }));
      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update teacher.";
      set({ error: message, isLoading: false });
      return false;
    }
  },

  removeTeacher: async (id: number) => {
    const originalTeachers = get().teachers;
    set((state) => ({
      teachers: state.teachers.filter((t) => t.id !== id),
    }));

    try {
      await deleteTeacher(id);
      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete teacher.";
      set({ error: message, teachers: originalTeachers });
      return false;
    }
  },
}));
