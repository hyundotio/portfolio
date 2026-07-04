"use client";

import styles from "@/Components/Home.module.scss";
import { RouteTransitionMode } from "@/stores/viewStore";

interface TransitionOverlayProps {
  transitionKey: number;
  mode: RouteTransitionMode;
}

export default function TransitionOverlay({
  transitionKey,
  mode,
}: TransitionOverlayProps) {
  if (mode === "to-detail" || mode === "to-overview") {
    return null;
  }

  return (
    <div
      key={transitionKey}
      aria-hidden="true"
      className={`${styles["transition-overlay"]} ${styles["active"]} ${
        mode === "to-home" ? styles["transition-to-home"] : styles["transition-to-work"]
      }`.trim()}
    >
      <div className={styles["hero-bands"]}>
        {Array.from({ length: 5 }).map((_, index) => (
          <span key={index} className={styles["hero-band"]} />
        ))}
      </div>
    </div>
  );
}
