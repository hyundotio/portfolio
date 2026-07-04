"use client";

import { ReactNode, useEffect, useState } from "react";
import styles from "@/Components/Home.module.scss";
import WorkActions from "@/Components/WorkActions";
import { WORK_DETAIL_EXIT_EVENT } from "@/Components/WorkViewMoreButton";

interface WorkOverlayClientProps {
  nextId: string;
  prevId: string;
  children: ReactNode;
}

export default function WorkOverlayClient({
  nextId,
  prevId,
  children,
}: WorkOverlayClientProps) {
  const [isNavigatingToDetail, setIsNavigatingToDetail] = useState(false);

  useEffect(() => {
    const handleDetailExit = () => setIsNavigatingToDetail(true);

    window.addEventListener(WORK_DETAIL_EXIT_EVENT, handleDetailExit);

    return () => {
      window.removeEventListener(WORK_DETAIL_EXIT_EVENT, handleDetailExit);
    };
  }, []);

  return (
    <div
      className={`${styles["container"]} ${
        isNavigatingToDetail ? styles["container-detail-exiting"] : ""
      }`.trim()}
    >
      <WorkActions nextId={nextId} prevId={prevId} />
      {children}
    </div>
  );
}
