"use client";

import { useEffect, useMemo } from "react";
import { useThemeStore } from "@/stores/themeStore";

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const initializeTheme = useThemeStore((state) => state.initializeTheme);
  const setMounted = useThemeStore((state) => state.setMounted);
  const setSystemTheme = useThemeStore((state) => state.setSystemTheme);

  useEffect(() => {
    initializeTheme();
    const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
    const updateTheme = () => {
      setSystemTheme(mediaQuery.matches ? "light" : "dark");
    };

    mediaQuery.addEventListener("change", updateTheme);

    return () => mediaQuery.removeEventListener("change", updateTheme);
  }, [initializeTheme, setSystemTheme]);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setMounted(true);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [setMounted]);

  return children;
}

export function useTheme() {
  const theme = useThemeStore((state) => state.theme);
  const mode = useThemeStore((state) => state.mode);
  const mounted = useThemeStore((state) => state.mounted);
  const cycleThemeMode = useThemeStore((state) => state.cycleThemeMode);

  return useMemo(
    () => ({
      theme,
      mode,
      mounted,
      cycleThemeMode,
    }),
    [theme, mode, mounted, cycleThemeMode],
  );
}
