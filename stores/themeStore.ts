"use client";

import { create } from "zustand";

export type Theme = "dark" | "light";
export type ThemeMode = Theme | "auto";

export const THEME_STORAGE_KEY = "portfolio-theme";

interface ThemeStoreState {
  mode: ThemeMode;
  theme: Theme;
  systemTheme: Theme;
  mounted: boolean;
  initializeTheme: () => void;
  setMounted: (mounted: boolean) => void;
  setSystemTheme: (theme: Theme) => void;
  cycleThemeMode: () => void;
}

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

function resolveTheme(mode: ThemeMode, systemTheme: Theme): Theme {
  return mode === "auto" ? systemTheme : mode;
}

function getStoredThemeMode(): ThemeMode | null {
  if (typeof window === "undefined") return null;

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "dark" || stored === "light" || stored === "auto"
    ? stored
    : null;
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.dataset.theme = theme;
}

export const useThemeStore = create<ThemeStoreState>((set, get) => ({
  mode: "auto",
  theme: "dark",
  systemTheme: "dark",
  mounted: false,
  initializeTheme: () => {
    const systemTheme = getSystemTheme();
    const mode = getStoredThemeMode() ?? "auto";
    const theme = resolveTheme(mode, systemTheme);

    applyTheme(theme);

    set({
      mode,
      theme,
      systemTheme,
    });
  },
  setMounted: (mounted) => {
    set({ mounted });
  },
  setSystemTheme: (systemTheme) => {
    const theme = resolveTheme(get().mode, systemTheme);

    applyTheme(theme);

    set({
      systemTheme,
      theme,
    });
  },
  cycleThemeMode: () => {
    const nextMode =
      get().mode === "dark"
        ? "light"
        : get().mode === "light"
          ? "auto"
          : "dark";

    const theme = resolveTheme(nextMode, get().systemTheme);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextMode);
    }

    applyTheme(theme);

    set({
      mode: nextMode,
      theme,
    });
  },
}));
