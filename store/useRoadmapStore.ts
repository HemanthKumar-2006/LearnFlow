// Global app state — Zustand + localStorage persistence.
//
// We persist the latest roadmap, progress (per-topic completion), and the
// last form input so the user's session survives a page refresh.

"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Roadmap, RoadmapInput } from "@/lib/types";
import { recomputePace } from "@/lib/roadmapEngine";

interface RoadmapState {
  roadmap: Roadmap | null;
  lastInput: RoadmapInput | null;
  isGenerating: boolean;
  error: string | null;

  setRoadmap: (r: Roadmap) => void;
  setLastInput: (i: RoadmapInput) => void;
  setGenerating: (g: boolean) => void;
  setError: (e: string | null) => void;

  toggleTopic: (topicId: string) => void;
  updatePace: (hoursPerWeek: number) => void;
  reset: () => void;
}

// Pure helper — derive progress from a roadmap. Not stored in state so it
// can't introduce render loops via Zustand's selector reference checks.
export function deriveProgress(roadmap: Roadmap | null) {
  if (!roadmap) return { completed: 0, total: 0, percent: 0 };
  let completed = 0;
  let total = 0;
  for (const phase of roadmap.phases) {
    for (const t of phase.topics) {
      total++;
      if (t.completed) completed++;
    }
  }
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { completed, total, percent };
}

export const useRoadmapStore = create<RoadmapState>()(
  persist(
    (set, get) => ({
      roadmap: null,
      lastInput: null,
      isGenerating: false,
      error: null,

      setRoadmap: (roadmap) => set({ roadmap, error: null }),
      setLastInput: (lastInput) => set({ lastInput }),
      setGenerating: (isGenerating) => set({ isGenerating }),
      setError: (error) => set({ error }),

      toggleTopic: (topicId) => {
        const r = get().roadmap;
        if (!r) return;
        const phases = r.phases.map((p) => ({
          ...p,
          topics: p.topics.map((t) =>
            t.id === topicId ? { ...t, completed: !t.completed } : t,
          ),
        }));
        set({ roadmap: { ...r, phases } });
      },

      updatePace: (hoursPerWeek) => {
        const r = get().roadmap;
        if (!r) return;
        set({ roadmap: recomputePace(r, hoursPerWeek) });
      },

      reset: () => set({ roadmap: null, lastInput: null, error: null }),
    }),
    {
      name: "learnflow-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        roadmap: state.roadmap,
        lastInput: state.lastInput,
      }),
    },
  ),
);
