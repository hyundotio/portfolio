"use client";

import { useSyncExternalStore } from "react";
import { THEME_KEY as KEY } from "./themeScript";

type Theme = "system" | "light" | "dark";
const OPTIONS: Theme[] = ["system", "light", "dark"];
const EVENT = "themechange";

function read(): Theme {
  const t = document.documentElement.dataset.theme;
  return t === "light" || t === "dark" ? t : "system";
}

function apply(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") delete root.dataset.theme;
  else root.dataset.theme = theme;
}

function subscribe(onChange: () => void) {
  // Another tab changed the theme: follow it here too.
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY && e.key !== null) return;
    const t = e.newValue;
    apply(t === "light" || t === "dark" ? t : "system");
    onChange();
  };
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function choose(theme: Theme) {
  try {
    if (theme === "system") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, theme);
  } catch {
    // Storage blocked (private mode): still switch for this visit.
  }
  apply(theme);
  window.dispatchEvent(new Event(EVENT));
}

/** System / Light / Dark, as three text buttons. */
export default function ThemeSwitch({ className = "" }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, read, () => "system" as Theme);

  return (
    <div className={`theme-switch ${className}`} role="group" aria-label="Color theme">
      {OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={theme === option}
          onClick={() => choose(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
