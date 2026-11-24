"use client";

import { useEffect } from "react";

/**
 * Links to a #section on the current page glide there instead of jumping.
 * Next.js scrolls hash links instantly, so same-page ones are handled here
 * (the capture listener runs before Link's handler, which then stands down).
 * Links to other pages are left to Next.js. Respects reduced motion.
 */
export default function SmoothHashLinks() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      const link = (event.target as Element | null)?.closest?.("a[href*='#']");
      if (!(link instanceof HTMLAnchorElement) || link.target === "_blank") return;

      const url = new URL(link.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname) return;
      const target = url.hash && document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!target) return;

      event.preventDefault();
      history.pushState(history.state, "", url.hash);

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      // Wait a frame so an open menu can close and release the scroll lock.
      requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      });
    };

    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
