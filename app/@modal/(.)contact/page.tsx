/* app/@modal/(.)contact/page.tsx */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import ContactForm from "@/Components/ContactForm";
import { getModalDismissTarget } from "@/Components/modalRouteHistory";
import styles from "../modal.module.scss";

export default function ContactModal() {
  const router = useRouter();
  const isClosingRef = useRef(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsActive(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.modalOpen = "true";

    return () => {
      delete document.documentElement.dataset.modalOpen;
    };
  }, []);

  const handleClose = useCallback(() => {
    if (isClosingRef.current) {
      return;
    }

    isClosingRef.current = true;
    setIsActive(false);
    setIsClosing(true);
    setTimeout(() => {
      const { basePath, depth } = getModalDismissTarget();

      if (depth > 0 && window.history.length > depth) {
        window.history.go(-depth);
      } else {
        router.replace(basePath);
      }
    }, 400);
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
    <div
      className={`${styles.backdrop} ${isClosing ? styles["fade-out"] : ""}`}
      onClick={handleClose}
    >
      <div
        className={`${styles.content} ${isClosing ? styles["slide-down"] : ""} ${isActive ? styles.active : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`${styles.line} ${styles["line-top"]}`} />
        <div className={`${styles.line} ${styles["line-right"]}`} />
        <div className={`${styles.line} ${styles["line-bottom"]}`} />
        <div className={`${styles.line} ${styles["line-left"]}`} />

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
