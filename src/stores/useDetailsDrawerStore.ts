import { create } from "zustand";
import type { ReactNode } from "react";

interface DetailsDrawerState {
  isOpen: boolean;
  title: string;
  content: ReactNode | null;
  openDrawer: (title: string, content: ReactNode) => void;
  closeDrawer: () => void;
}

export const useDetailsDrawerStore = create<DetailsDrawerState>((set) => ({
  isOpen: false,
  title: "",
  content: null,
  openDrawer: (title, content) => set({ isOpen: true, title, content }),
  closeDrawer: () => set({ isOpen: false, title: "", content: null }),
}));
