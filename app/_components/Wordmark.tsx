"use client";

import { useLayoutEffect, useRef } from "react";

// Letter widths in hundredths of an em, from Helvetica Neue Bold. The fallback
// runs a little narrower, so the first estimate never overshoots the column.
const UPPER = [
  69, 71, 75, 75, 65, 60, 76, 75, 30, 56, 73, 60, 91, 75, 78, 67, 78, 73, 65,
  62, 75, 63, 95, 67, 67, 65,
];
const LOWER = [
  58, 62, 58, 62, 58, 34, 62, 60, 26, 28, 58, 26, 91, 60, 62, 62, 62, 39, 54,
  36, 60, 52, 82, 54, 52, 52,
];
const SPACE = 28;
const OTHER = 56; // figures
const TRACKING = -0.04; // the wordmark's letter-spacing, in em

/** Estimated set width of the text, in em. */
function ems(text: string) {
  let total = 0;
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    const width =
      ch === " " ? SPACE : (UPPER[code - 65] ?? LOWER[code - 97] ?? OTHER);
    total += width / 100 + TRACKING;
  }
  return Math.round(total * 1000) / 1000;
}

/**
 * A wordmark sized so it spans its container's width, capped at half the
 * viewport height for short names. On small screens each word gets its own line.
 * CSS gives a close estimate first (via --ems); this refines it.
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
  const longest = Math.max(...words.map(ems));

  return (
    <span
      ref={ref}
      className="wordmark"
      style={
        { "--ems": ems(text), "--longest-ems": longest } as React.CSSProperties
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
