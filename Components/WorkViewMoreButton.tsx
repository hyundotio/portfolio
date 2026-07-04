"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "@/Components/Home.module.scss";
import { useRouteTransition } from "@/Components/RouteTransitionProvider";

export const WORK_DETAIL_EXIT_EVENT = "work-detail-exit";

interface WorkViewMoreButtonProps {
  activeWorkId: string;
}

export default function WorkViewMoreButton({
  activeWorkId,
}: WorkViewMoreButtonProps) {
  const router = useRouter();
  const { startTransition } = useRouteTransition();
  const detailHref = `/work/${activeWorkId}/details`;

  useEffect(() => {
    router.prefetch(detailHref);
  }, [detailHref, router]);

  const handleTransitionNavigation = () => {
    const transitionPlan = startTransition(detailHref);

    if (!transitionPlan) {
      router.push(detailHref, { scroll: false });
      return;
    }

    window.dispatchEvent(new Event(WORK_DETAIL_EXIT_EVENT));

    window.setTimeout(() => {
      router.push(detailHref, { scroll: false });
    }, transitionPlan.navigationDelayMs);
  };

  return (
    <button
      type="button"
      className={`${styles["view-more-link"]} ${styles["preview-card-action"]}`}
      onClick={handleTransitionNavigation}
    >
      View more
    </button>
  );
}
