"use client";

import { RefObject, useEffect, useRef, useState } from "react";

interface UseTypewriterKickstartOptions {
  enabled?: boolean;
  once?: boolean;
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
}

interface TypewriterKickstartResult<T extends HTMLElement> {
  ref: RefObject<T | null>;
  shouldType: boolean;
  isVisible: boolean;
}

export default function useTypewriterKickstart<T extends HTMLElement>({
  enabled = true,
  once = true,
  root = null,
  rootMargin = "0px 0px -20% 0px",
  threshold = 0,
}: UseTypewriterKickstartOptions = {}): TypewriterKickstartResult<T> {
  const ref = useRef<T>(null);
  const [observedIsVisible, setObservedIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const supportsIntersectionObserver =
    typeof IntersectionObserver !== "undefined";

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const node = ref.current;

    if (!node) {
      return;
    }

    if (!supportsIntersectionObserver) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const nextIsVisible = entry?.isIntersecting ?? false;
        setObservedIsVisible(nextIsVisible);

        if (nextIsVisible) {
          setHasTriggered(true);

          if (once) {
            observer.disconnect();
          }
        }
      },
      {
        root,
        rootMargin,
        threshold,
      },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [enabled, once, root, rootMargin, supportsIntersectionObserver, threshold]);

  const isVisible =
    enabled && (supportsIntersectionObserver ? observedIsVisible : true);
  const shouldType = enabled && (once ? hasTriggered || isVisible : isVisible);

  return {
    ref,
    shouldType,
    isVisible,
  };
}
