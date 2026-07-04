"use client";

import Link from "next/link";
import styles from "@/Components/Home.module.scss";
import Icon from "@/Components/Icon";

interface WorkActionsProps {
  nextId: string;
  prevId: string;
}

export default function WorkActions({ nextId, prevId }: WorkActionsProps) {
  return (
    <div className={styles.actions}>
      {/* {showOdModeButton ? (
        <button
          type="button"
          className={`${styles["od-mode-button"]} ${
            odModeEnabled ? styles["od-mode-active"] : ""
          }`.trim()}
          onClick={() => setOdModeEnabled(true)}
        >
          {odModeEnabled ? "OD mode active" : "Enter OD mode"}
        </button>
      ) : null} */}
      <Link
        aria-label="Previous work"
        className={styles["work-link"]}
        href={`/work/${prevId}`}
      >
        <Icon className={styles["work-link-icon"]} name="arrow-up" />
      </Link>
      <Link
        aria-label="Next work"
        className={styles["work-link"]}
        href={`/work/${nextId}`}
      >
        <Icon className={styles["work-link-icon"]} name="arrow-down" />
      </Link>
    </div>
  );
}
