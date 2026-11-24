"use client";

import Image from "next/image";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export type ViewerItem = {
  src: string;
  alt: string;
  width: number;
  height: number;
  isVideo?: boolean;
  title?: string;
  subtitle?: string;
  link?: { href: string; text: string } | null;
};

const OpenContext = createContext<(index: number) => void>(() => {});

const SWIPE_DISTANCE = 60;

/**
 * Full-screen viewer for every image and video on a page.
 * Tap to open. Swipe sideways (or use arrow keys / buttons) to move,
 * swipe down (or Esc / Close) to dismiss, pinch to zoom.
 */
export function MediaViewer({
  items,
  children,
}: {
  items: readonly ViewerItem[];
  children: React.ReactNode;
}) {
  const [index, setIndex] = useState<number | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoomed, setZoomed] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);

  const go = useCallback(
    (step: number) =>
      setIndex((i) =>
        i === null ? i : Math.min(items.length - 1, Math.max(0, i + step)),
      ),
    [items.length],
  );

  // Keep the native <dialog> in sync with state.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (index !== null && !dialog.open) {
      dialog.showModal();
      document.documentElement.classList.add("viewer-open");
    } else if (index === null && dialog.open) {
      dialog.close();
    }
  }, [index]);

  // When the page is pinch-zoomed, let the browser pan instead of swiping.
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => setZoomed(vv.scale > 1.01);
    vv.addEventListener("resize", update);
    return () => vv.removeEventListener("resize", update);
  }, []);

  const handleClose = () => {
    document.documentElement.classList.remove("viewer-open");
    drag.current = null;
    setOffset({ x: 0, y: 0 });
    setIndex(null);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" || zoomed) return;
    if ((e.target as Element).closest("video, a, button")) return;
    // A second finger means a pinch, not a swipe.
    if (drag.current) {
      drag.current = null;
      setOffset({ x: 0, y: 0 });
      return;
    }
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const x = e.clientX - d.x;
    const y = e.clientY - d.y;
    setOffset(Math.abs(x) > Math.abs(y) ? { x, y: 0 } : { x: 0, y: Math.max(0, y) });
  };

  const endDrag = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    const x = e.clientX - d.x;
    const y = e.clientY - d.y;
    setOffset({ x: 0, y: 0 });
    if (e.type !== "pointerup") return;
    if (Math.abs(x) > Math.abs(y) && Math.abs(x) > SWIPE_DISTANCE) {
      go(x < 0 ? 1 : -1);
    } else if (y > SWIPE_DISTANCE * 1.5 && y > Math.abs(x)) {
      dialogRef.current?.close();
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.target as Element).closest("video")) return;
    if (e.key === "ArrowRight") go(1);
    if (e.key === "ArrowLeft") go(-1);
  };

  const item = index === null ? null : items[index];
  const dragging = offset.x !== 0 || offset.y !== 0;

  return (
    <OpenContext.Provider value={setIndex}>
      {children}
      <dialog
        ref={dialogRef}
        className="viewer"
        aria-label="Media viewer"
        onClose={handleClose}
        onKeyDown={onKeyDown}
      >
        {item && index !== null && (
          <>
            <div className="viewer-bar small">
              <p className="muted" aria-live="polite">
                {index + 1} of {items.length}
              </p>
              <button
                type="button"
                autoFocus
                onClick={() => dialogRef.current?.close()}
              >
                Close
              </button>
            </div>

            <div
              className="viewer-stage"
              style={{ touchAction: zoomed ? "auto" : "pinch-zoom" }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            >
              <div
                key={index}
                className="viewer-media"
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px)`,
                  opacity: offset.y ? Math.max(0.3, 1 - offset.y / 400) : 1,
                  transition: dragging ? "none" : "transform 150ms ease-out",
                }}
              >
                {item.isVideo ? (
                  <video
                    src={item.src}
                    width={item.width}
                    height={item.height}
                    controls
                    autoPlay
                    playsInline
                    aria-label={item.alt}
                  />
                ) : (
                  <Image
                    src={item.src}
                    alt={item.alt}
                    width={item.width}
                    height={item.height}
                    sizes="100vw"
                    loading="eager"
                    draggable={false}
                  />
                )}
              </div>
            </div>

            <div className="viewer-foot small">
              <button
                type="button"
                className="viewer-prev"
                onClick={() => go(-1)}
                disabled={index === 0}
              >
                Previous
              </button>
              <p className="viewer-caption muted">
                {item.title && <span className="fig-title">{item.title}</span>}
                {item.title && item.subtitle && ". "}
                {item.subtitle}
                {(item.link || !item.isVideo) && (
                  <span className="viewer-links">
                    {item.link && (
                      <a href={item.link.href} target="_blank" rel="noreferrer">
                        {item.link.text}
                      </a>
                    )}
                    {!item.isVideo && (
                      <a href={item.src} target="_blank" rel="noreferrer">
                        Open original
                      </a>
                    )}
                  </span>
                )}
              </p>
              <button
                type="button"
                className="viewer-next"
                onClick={() => go(1)}
                disabled={index === items.length - 1}
              >
                Next
              </button>
            </div>
          </>
        )}
      </dialog>
    </OpenContext.Provider>
  );
}

/** Wraps a thumbnail so tapping it opens the viewer at `index`. */
export function MediaOpen({
  index,
  label,
  className = "media-open",
  children,
}: {
  index: number;
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  const open = useContext(OpenContext);
  return (
    <button
      type="button"
      className={className}
      aria-label={label}
      onClick={() => open(index)}
    >
      {children}
    </button>
  );
}
