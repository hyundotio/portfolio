"use client";

import { ReactNode, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import sceneStyles from "@/app/layout.module.scss";
import BackgroundOrchestrator from "@/Components/BackgroundOrchestrator";
import GlobalCanvas from "@/Components/GlobalCanvas";
import Header from "@/Components/Header";
import { rememberNonModalRoute } from "@/Components/modalRouteHistory";
import { useRouteTransition } from "@/Components/RouteTransitionProvider";
import ScrollBridge from "@/Components/ScrollBridge";
import { useViewStore } from "@/stores/viewStore";

interface LinkProp {
  title: string;
  href: string;
  target?: string;
}

interface AppShellProps {
  children: ReactNode;
  modal: ReactNode;
  navLinks: LinkProp[];
}

export default function AppShell({
  children,
  modal,
  navLinks,
}: AppShellProps) {
  const pathname = usePathname();
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const { activeTransition } = useRouteTransition();
  const odModeEnabled = useViewStore((state) => state.odModeEnabled);
  const setDetailCanvasInView = useViewStore(
    (state) => state.setDetailCanvasInView,
  );
  const hideChrome =
    pathname === "/work/kayhan-space" && odModeEnabled;
  const isDetailRoute = /^\/work\/[^/]+\/details$/.test(pathname);
  const isDetailEntry = activeTransition?.mode === "to-detail";
  const isDetailExit = activeTransition?.mode === "to-overview";
  const canvasViewportStateClassName = isDetailEntry
    ? sceneStyles["canvas-container-detail-entering"]
    : isDetailExit
      ? sceneStyles["canvas-container-detail-exiting"]
      : isDetailRoute
        ? sceneStyles["canvas-container-detail"]
        : sceneStyles["canvas-container-full"];
  const canvasStageStateClassName = isDetailEntry
    ? sceneStyles["canvas-stage-detail-entering"]
    : isDetailExit
      ? sceneStyles["canvas-stage-detail-exiting"]
      : isDetailRoute
        ? sceneStyles["canvas-stage-detail"]
        : sceneStyles["canvas-stage-full"];
  const canvasContainerClassName =
    `${sceneStyles["canvas-container"]} ${canvasViewportStateClassName}`.trim();
  const canvasStageClassName =
    `${sceneStyles["canvas-stage"]} ${canvasStageStateClassName}`.trim();

  useEffect(() => {
    rememberNonModalRoute();
  }, [pathname]);

  useEffect(() => {
    if (!isDetailRoute) {
      setDetailCanvasInView(true);
      return;
    }

    const canvasContainer = canvasContainerRef.current;

    if (!canvasContainer) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setDetailCanvasInView(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: "900px 0px 900px 0px",
        threshold: 0,
      },
    );

    observer.observe(canvasContainer);

    return () => {
      observer.disconnect();
      setDetailCanvasInView(true);
    };
  }, [isDetailRoute, setDetailCanvasInView]);

  return (
    <div className={sceneStyles["app-shell"]}>
      <div
        aria-hidden={hideChrome}
        className={`${sceneStyles["main-orchestrator"]} ${
          hideChrome ? sceneStyles["main-orchestrator-hidden"] : ""
        }`.trim()}
      >
        <Header links={navLinks} />
        <BackgroundOrchestrator />
        <main>{children}</main>
        {modal}
      </div>
      <ScrollBridge />
      <div ref={canvasContainerRef} className={canvasContainerClassName}>
        <div className={canvasStageClassName}>
          <GlobalCanvas />
        </div>
      </div>
    </div>
  );
}
