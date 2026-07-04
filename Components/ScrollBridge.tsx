"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useRouteTransition } from "@/Components/RouteTransitionProvider";
import { WORK_DATA } from "@/content/work";
import { useViewStore } from "@/stores/viewStore";

export default function ScrollBridge() {
  const router = useRouter();
  const pathname = usePathname();
  const { startTransition } = useRouteTransition();
  const odModeEnabled = useViewStore((state) => state.odModeEnabled);
  const lastAction = useRef(0);

  useEffect(() => {
    if (pathname === "/work/kayhan-space" && odModeEnabled) {
      return;
    }

    const THROTTLE_MS = 1500;
    const SCROLL_THRESHOLD = 50;
    const isHomePage = pathname === "/";
    const pathSegments = pathname.split("/").filter(Boolean);
    const isWorkPage =
      pathSegments.length === 2 &&
      pathSegments[0] === "work" &&
      WORK_DATA.some((w) => w.id === pathSegments[1]);

    const navigateTo = (href: string) => {
      const transitionPlan = startTransition(href);

      if (!transitionPlan) {
        router.push(href);
        return;
      }

      window.setTimeout(() => {
        router.push(href);
      }, transitionPlan.navigationDelayMs);
    };

    const navigateWork = (direction: "next" | "prev") => {
      if (Date.now() - lastAction.current < THROTTLE_MS) {
        return;
      }

      if (isHomePage && direction === "next") {
        lastAction.current = Date.now();
        navigateTo(`/work/${WORK_DATA[0].id}`);
        return;
      }

      if (!isWorkPage) {
        return;
      }

      const currentId = pathSegments[1];
      const idx = WORK_DATA.findIndex((w) => w.id === currentId);

      if (idx === -1) return;

      lastAction.current = Date.now();

      if (direction === "next") {
        const nextIdx = (idx + 1) % WORK_DATA.length;
        navigateTo(`/work/${WORK_DATA[nextIdx].id}`);
      } else {
        const prevIdx = (idx - 1 + WORK_DATA.length) % WORK_DATA.length;
        navigateTo(`/work/${WORK_DATA[prevIdx].id}`);
      }
    };

    const handleScroll = (e: WheelEvent) => {
      if (isHomePage) return;

      const target = e.target;
      if (
        target instanceof Element &&
        target.closest("[data-work-preview-scroll]")
      ) {
        return;
      }

      // 1. Exit if we are throttling or scroll intensity is too low
      if (
        Math.abs(e.deltaY) < SCROLL_THRESHOLD ||
        Date.now() - lastAction.current < THROTTLE_MS
      ) {
        return;
      }

      if (e.deltaY > 0) {
        navigateWork("next");
      } else if (e.deltaY < 0) {
        navigateWork("prev");
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isHomePage && !isWorkPage) {
        return;
      }

      if (
        e.key === "ArrowDown" ||
        e.key === "s" ||
        e.key === "S" ||
        e.key === "ArrowUp" ||
        e.key === "w" ||
        e.key === "W"
      ) {
        e.preventDefault();
      }

      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
        navigateWork("next");
      } else if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        navigateWork("prev");
      }
    };

    window.addEventListener("wheel", handleScroll, { passive: true });
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("wheel", handleScroll);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [odModeEnabled, pathname, router, startTransition]);

  return null;
}
