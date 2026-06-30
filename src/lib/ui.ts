"use client";

import { create } from "zustand";
import type { View } from "./types";

interface UIState {
  view: View;
  setView: (v: View) => void;
  addOpen: boolean;
  setAddOpen: (b: boolean) => void;
  /** lets modules ask the assistant something (e.g. "Plan my day"). */
  assistantSeed: string | null;
  askAssistant: (prompt: string) => void;
  clearAssistantSeed: () => void;
}

export const useUI = create<UIState>((set) => ({
  view: "home",
  setView: (view) => set({ view, addOpen: false }),
  addOpen: false,
  setAddOpen: (addOpen) => set({ addOpen }),
  assistantSeed: null,
  askAssistant: (prompt) => set({ assistantSeed: prompt, view: "assistant" }),
  clearAssistantSeed: () => set({ assistantSeed: null }),
}));
