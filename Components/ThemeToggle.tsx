"use client";

import { useTheme } from "@/Components/ThemeProvider";
import ThemeToggleView from "@/Components/ThemeToggleView";

interface ThemeToggleProps {
  onToggle?: () => void;
  variant?: "icon" | "text";
}

function getThemeLabel(mode: "auto" | "dark" | "light") {
  return mode === "auto" ? "Auto" : mode === "dark" ? "Dark" : "Light";
}

export default function ThemeToggle({
  onToggle,
  variant = "icon",
}: ThemeToggleProps) {
  const { mode, cycleThemeMode, mounted } = useTheme();
  const themeLabel = mounted ? getThemeLabel(mode) : "Auto";
  const ariaLabel = mounted
    ? `Theme mode: ${themeLabel}`
    : "Theme mode";

  return (
    <ThemeToggleView
      ariaLabel={ariaLabel}
      icon={mounted ? mode : "auto"}
      onClick={() => {
        cycleThemeMode();
        onToggle?.();
      }}
      text={`Theme: ${themeLabel}`}
      variant={variant}
    />
  );
}
