"use client";

import { useLayoutEffect, useRef } from "react";

/**
 * A wordmark sized so it spans its container's width, capped at half the
 * viewport height for short names. On small screens each word gets its own line.
 * CSS gives a close estimate first (via --chars); this refines it.
 */
export default function Wordmark({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    const box = el?.parentElement;
    if (!el || !box) return;

    let lastWidth = -1;
    const fit = (force = false) => {
      const width = box.clientWidth;
      if (!force && width === lastWidth) return;
      lastWidth = width;
      el.style.fontSize = "100px";
      const size = Math.min(
        (100 * width) / el.scrollWidth,
        window.innerHeight * 0.5,
      );
      el.style.fontSize = `${Math.floor(size * 10) / 10}px`;
    };

    fit(true);
    const ro = new ResizeObserver(() => fit());
    ro.observe(box);
    document.fonts?.ready.then(() => fit(true));
    return () => ro.disconnect();
  }, [text]);

  // Words are separate spans so small screens can stack them (see CSS);
  // the fit still works because scrollWidth is then the longest line.
  const words = text.split(" ");
  const longest = Math.max(...words.map((w) => w.length));

  return (
    <span
      ref={ref}
      className="wordmark"
      style={
        { "--chars": text.length, "--longest": longest } as React.CSSProperties
      }
    >
      {words.map((word, i) => (
        <span key={i} className="wordmark-word">
          {word}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
}
