"use client";

import styles from "@/Components/Header.module.scss";
import Icon from "@/Components/Icon";
import type { ThemeMode } from "@/stores/themeStore";

interface ThemeToggleViewProps {
  ariaLabel: string;
  icon: ThemeMode;
  onClick: () => void;
  text?: string;
  variant?: "icon" | "text";
}

export default function ThemeToggleView({
  ariaLabel,
  icon,
  onClick,
  text,
  variant = "icon",
}: ThemeToggleViewProps) {
  return (
    <button
      type="button"
      className={`${styles["theme-toggle"]} ${
        variant === "text" ? styles["theme-toggle-text"] : ""
      }`.trim()}
      onClick={onClick}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      {variant === "text" ? (
        <span>{text}</span>
      ) : (
        <Icon className={styles["theme-icon"]} name={icon} />
      )}
    </button>
  );
}
