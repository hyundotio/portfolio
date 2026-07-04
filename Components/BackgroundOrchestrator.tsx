"use client";

import TransitionOverlay from "@/Components/TransitionOverlay";
import { useRouteTransition } from "@/Components/RouteTransitionProvider";

export default function BackgroundOrchestrator() {
  const { activeTransition } = useRouteTransition();

  if (!activeTransition) {
    return null;
  }

  return (
    <TransitionOverlay
      transitionKey={activeTransition.key}
      mode={activeTransition.mode}
    />
  );
}
