"use client";

import { create } from "zustand";

export type RouteTransitionMode =
  | "to-work"
  | "to-home"
  | "to-detail"
  | "to-overview";

export interface ActiveRouteTransition {
  key: number;
  mode: RouteTransitionMode;
  startedAt: number;
  targetPathname: string | null;
}

interface ViewStoreState {
  activeTransition: ActiveRouteTransition | null;
  transitionCount: number;
  odModeEnabled: boolean;
  detailCanvasInView: boolean;
  visualPathname: string;
  activateTransition: (
    mode: RouteTransitionMode,
    targetPathname?: string | null,
  ) => void;
  clearTransition: () => void;
  toggleOdMode: () => void;
  setOdModeEnabled: (enabled: boolean) => void;
  setDetailCanvasInView: (inView: boolean) => void;
  setVisualPathname: (pathname: string) => void;
}

export const useViewStore = create<ViewStoreState>((set) => ({
  activeTransition: null,
  transitionCount: 0,
  odModeEnabled: false,
  detailCanvasInView: true,
  visualPathname: "/",
  activateTransition: (mode, targetPathname = null) =>
    set((state) => ({
      transitionCount: state.transitionCount + 1,
      activeTransition: {
        key: state.transitionCount + 1,
        mode,
        startedAt: Date.now(),
        targetPathname,
      },
    })),
  clearTransition: () => set({ activeTransition: null }),
  toggleOdMode: () =>
    set((state) => ({ odModeEnabled: !state.odModeEnabled })),
  setOdModeEnabled: (enabled) => set({ odModeEnabled: enabled }),
  setDetailCanvasInView: (inView) => set({ detailCanvasInView: inView }),
  setVisualPathname: (pathname) => set({ visualPathname: pathname }),
}));
