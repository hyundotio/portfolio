"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { RouteTransitionMode, useViewStore } from "@/stores/viewStore";

const ROUTE_TRANSITION_DURATION_MS = 1180;
const TO_WORK_NAVIGATION_DELAY_MS = 96;
const TO_HOME_NAVIGATION_DELAY_MS = 980;
const TO_DETAIL_NAVIGATION_DELAY_MS = 260;
const TO_OVERVIEW_NAVIGATION_DELAY_MS = 220;

function parseWorkPathname(pathname: string) {
  const match = pathname.match(/^\/work\/([^/]+)(?:\/(details))?$/);

  if (!match) {
    return null;
  }

  return {
    id: match[1],
    view: match[2] === "details" ? "details" : "overview",
  } as const;
}

function resolveTransitionMode(
  fromPathname: string,
  toPathname: string,
): RouteTransitionMode | null {
  const fromWork = parseWorkPathname(fromPathname);
  const toWork = parseWorkPathname(toPathname);

  if (fromPathname === "/" && toPathname.startsWith("/work")) {
    return "to-work";
  }

  if (fromPathname.startsWith("/work") && toPathname === "/") {
    return "to-home";
  }

  if (
    fromWork?.view === "overview" &&
    toWork?.view === "details" &&
    fromWork.id === toWork.id
  ) {
    return "to-detail";
  }

  if (
    fromWork?.view === "details" &&
    toWork?.view === "overview" &&
    fromWork.id === toWork.id
  ) {
    return "to-overview";
  }

  return null;
}

function normalizePathname(href: string) {
  if (typeof window === "undefined") {
    return href;
  }

  try {
    return new URL(href, window.location.origin).pathname;
  } catch {
    return href;
  }
}

export default function RouteTransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const activeTransition = useViewStore((state) => state.activeTransition);
  const activateTransition = useViewStore((state) => state.activateTransition);
  const clearTransition = useViewStore((state) => state.clearTransition);
  const setOdModeEnabled = useViewStore((state) => state.setOdModeEnabled);
  const setVisualPathname = useViewStore((state) => state.setVisualPathname);
  const previousPathname = useRef(pathname);

  useEffect(() => {
    setVisualPathname(pathname);
  }, [pathname, setVisualPathname]);

  useEffect(() => {
    if (pathname !== "/work/kayhan-space") {
      setOdModeEnabled(false);
    }
  }, [pathname, setOdModeEnabled]);

  useEffect(() => {
    if (!activeTransition) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      clearTransition();
    }, ROUTE_TRANSITION_DURATION_MS);

    return () => window.clearTimeout(timeoutId);
  }, [activeTransition, clearTransition]);

  useEffect(() => {
    const fromPathname = previousPathname.current;
    previousPathname.current = pathname;

    if (activeTransition) {
      return;
    }

    const mode = resolveTransitionMode(fromPathname, pathname);

    if (!mode) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      activateTransition(mode, pathname);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [activeTransition, activateTransition, pathname]);

  return children;
}

export function useRouteTransition() {
  const pathname = usePathname();
  const activeTransition = useViewStore((state) => state.activeTransition);
  const activateTransition = useViewStore((state) => state.activateTransition);
  const setVisualPathname = useViewStore((state) => state.setVisualPathname);

  return {
    activeTransition,
    startTransition: (href: string) => {
      const targetPathname = normalizePathname(href);
      const mode = resolveTransitionMode(pathname, targetPathname);

      if (!mode) {
        return null;
      }

      activateTransition(mode, targetPathname);

      if (mode === "to-work" || mode === "to-detail") {
        setVisualPathname(targetPathname);
      }

      return {
        navigationDelayMs:
          mode === "to-work"
            ? TO_WORK_NAVIGATION_DELAY_MS
            : mode === "to-home"
              ? TO_HOME_NAVIGATION_DELAY_MS
              : mode === "to-detail"
                ? TO_DETAIL_NAVIGATION_DELAY_MS
                : TO_OVERVIEW_NAVIGATION_DELAY_MS,
      };
    },
  };
}
