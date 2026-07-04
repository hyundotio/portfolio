"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import ContactForm from "@/Components/ContactForm";
import { getModalDismissTarget } from "@/Components/modalRouteHistory";
import styles from "../@modal/modal.module.scss";

export default function ContactPage() {
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
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={handleClose}
          className={styles["close-btn"]}
          aria-label="Close contact modal"
        >
          <span aria-hidden="true" className={styles["close-icon"]} />
        </button>
        <div className={styles["modal-body"]}>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
