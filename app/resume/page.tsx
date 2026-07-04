"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Resume from "@/Components/Resume";
import { getModalDismissTarget } from "@/Components/modalRouteHistory";
import styles from "../@modal/modal.module.scss";

const resumePdfHref = "/assets/downloads/resume/resume.pdf";

export default function ResumePage() {
  const router = useRouter();

  const handleClose = useCallback(() => {
    const { basePath } = getModalDismissTarget();
    router.replace(basePath);
  }, [router]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleClose]);

  return (
    <div className={styles.backdrop} onClick={handleClose}>
      <div
        className={`${styles.content} ${styles["resume-content"]}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleClose}
          className={styles["close-btn"]}
          aria-label="Close resume modal"
        >
          <span aria-hidden="true" className={styles["close-icon"]} />
        </button>
        <a href={resumePdfHref} download className={styles["download-btn"]}>
          Download
        </a>
        <div className={`${styles["modal-body"]} ${styles["resume-body"]}`}>
          <Resume />
        </div>
      </div>
    </div>
  );
}
