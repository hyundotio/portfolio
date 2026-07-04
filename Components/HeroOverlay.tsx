"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/Components/Home.module.scss";
import TypewriterText from "@/Components/TypewriterText";
import { useRouteTransition } from "@/Components/RouteTransitionProvider";
import {
  canvasColorFallbacks,
  getResolvedCssToken,
} from "@/Components/themeTokens";

interface HeroProps {
  isVisible: boolean;
}

const HOME_ENTRY_TIMING = {
  initial: {
    revealDelayMs: 120,
    typingDelayMs: 120,
    cursorDitherDelayMs: 420,
  },
  return: {
    revealDelayMs: 10,
    typingDelayMs: 80,
    cursorDitherDelayMs: 1020,
  },
  default: {
    revealDelayMs: 1000,
    typingDelayMs: 750,
    cursorDitherDelayMs: 1000,
  },
} as const;

const HeroOverlay = ({ isVisible }: HeroProps) => {
  const [outlineActive, setOutlineActive] = useState(false);
  const [cursorDitherActive, setCursorDitherActive] = useState(false);
  const { activeTransition } = useRouteTransition();
  const [entryTiming] = useState(() => {
    if (activeTransition?.mode === "to-home") {
      return HOME_ENTRY_TIMING.return;
    }

    if (!activeTransition) {
      return HOME_ENTRY_TIMING.initial;
    }

    return HOME_ENTRY_TIMING.default;
  });
  const shouldRenderBands = activeTransition?.mode !== "to-home";
  const { revealDelayMs, typingDelayMs, cursorDitherDelayMs } = entryTiming;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isVisible) {
      // On return to home, let the copy pick up almost immediately after the wipe.
      const timer = setTimeout(() => {
        setOutlineActive(true);
      }, revealDelayMs);
      return () => clearTimeout(timer);
    }

    const frameId = window.requestAnimationFrame(() => {
      setOutlineActive(false);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [isVisible, revealDelayMs]);

  useEffect(() => {
    if (!isVisible) {
      const frameId = window.requestAnimationFrame(() => {
        setCursorDitherActive(false);
      });

      return () => window.cancelAnimationFrame(frameId);
    }

    const timer = window.setTimeout(() => {
      setCursorDitherActive(true);
    }, cursorDitherDelayMs);

    return () => window.clearTimeout(timer);
  }, [cursorDitherDelayMs, isVisible]);

  useEffect(() => {
    if (!cursorDitherActive) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) {
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pointer = {
      x: window.innerWidth * 0.66,
      y: window.innerHeight * 0.48,
      active: false,
      velocity: 0,
      lastMoveTime: 0,
    };
    const trail: Array<{ x: number; y: number; life: number; seed: number }> =
      [];
    let animationFrame = 0;
    let previousFrameTime = performance.now();
    const bayer4 = [
      [0, 8, 2, 10],
      [12, 4, 14, 6],
      [3, 11, 1, 9],
      [15, 7, 13, 5],
    ];
    let homeCursorDitherColor = getResolvedCssToken(
      "--cursor-dither",
      canvasColorFallbacks.cursorDither,
    );

    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const now = performance.now();
      const dx = event.clientX - pointer.x;
      const dy = event.clientY - pointer.y;
      const dt = Math.max(16, now - pointer.lastMoveTime || 16);
      pointer.velocity = Math.min(1, Math.hypot(dx, dy) / dt / 1.2);
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
      pointer.lastMoveTime = now;
      trail.unshift({
        x: event.clientX,
        y: event.clientY,
        life: 1,
        seed: Math.random() * 1000,
      });
      if (trail.length > 18) {
        trail.length = 18;
      }
    };

    const handlePointerLeave = () => {
      pointer.active = false;
    };

    const hashNoise = (x: number, y: number, seed: number) => {
      const value =
        Math.sin(x * 12.9898 + y * 78.233 + seed * 37.719) * 43758.5453;
      return value - Math.floor(value);
    };

    const drawCluster = (
      centerX: number,
      centerY: number,
      radius: number,
      strength: number,
      time: number,
      seed: number,
    ) => {
      const minX = Math.max(0, Math.floor(centerX - radius));
      const maxX = Math.min(window.innerWidth - 1, Math.ceil(centerX + radius));
      const minY = Math.max(0, Math.floor(centerY - radius));
      const maxY = Math.min(
        window.innerHeight - 1,
        Math.ceil(centerY + radius),
      );
      const motionNoise = pointer.velocity > 0.025;

      for (let y = minY; y <= maxY; y += 1) {
        for (let x = minX; x <= maxX; x += 1) {
          const dx = x - centerX;
          const dy = y - centerY;
          const distance = Math.hypot(dx, dy);
          if (distance > radius) {
            continue;
          }

          const falloff = 1 - distance / radius;
          const shimmer = motionNoise
            ? hashNoise(
                x * 0.9 + time * (18 + pointer.velocity * 30),
                y * 0.9 - time * (14 + pointer.velocity * 26),
                seed,
              )
            : hashNoise(x, y, seed);
          const density = Math.min(
            1,
            Math.max(
              0,
              falloff * (0.58 + strength * 0.34) + pointer.velocity * 0.04,
            ),
          );
          const orderedThreshold = (bayer4[y % 4][x % 4] + shimmer * 4) / 20;
          if (density <= orderedThreshold) {
            continue;
          }

          ctx.fillStyle = homeCursorDitherColor;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    };

    const render = (frameTime: number) => {
      const delta = Math.min(32, frameTime - previousFrameTime);
      previousFrameTime = frameTime;
      const time = frameTime * 0.001;
      const width = window.innerWidth;
      const height = window.innerHeight;

      ctx.clearRect(0, 0, width, height);
      homeCursorDitherColor = getResolvedCssToken(
        "--cursor-dither",
        canvasColorFallbacks.cursorDither,
      );

      for (let index = trail.length - 1; index >= 0; index -= 1) {
        trail[index].life -= delta / 420;
        if (trail[index].life <= 0) {
          trail.splice(index, 1);
        }
      }

      if (pointer.active) {
        drawCluster(pointer.x, pointer.y, 98, 1, time, 11);
      }

      trail.forEach((sample, index) => {
        const normalizedIndex = 1 - index / Math.max(1, trail.length);
        drawCluster(
          sample.x,
          sample.y,
          64 * sample.life,
          sample.life * 0.85 * normalizedIndex,
          time,
          sample.seed,
        );
      });

      pointer.velocity *= 0.92;
      animationFrame = window.requestAnimationFrame(render);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);
    animationFrame = window.requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      window.cancelAnimationFrame(animationFrame);
    };
  }, [cursorDitherActive]);

  return (
    <div
      className={`${styles["main-wrapper"]} ${isVisible ? styles["active"] : ""}`.trim()}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`${styles["cursor-dither"]} ${
          cursorDitherActive ? styles["cursor-dither-active"] : ""
        }`.trim()}
      />
      {shouldRenderBands ? (
        <div aria-hidden="true" className={styles["hero-bands"]}>
          {Array.from({ length: 5 }).map((_, index) => (
            <span key={index} className={styles["hero-band"]} />
          ))}
        </div>
      ) : null}
      <div
        className={`${styles["main-content"]} ${outlineActive ? styles["outline-active"] : ""}`.trim()}
      >
        <span className={styles["main-text"]}>
          <TypewriterText
            delayMs={typingDelayMs}
            speed={25}
            as="span"
            className={styles["hero-text"]}
            text={`Hello, I’m Hyun. I design and build products for complex systems.`}
            shouldType={isVisible}
            cursor
          />
        </span>
      </div>
    </div>
  );
};

export default HeroOverlay;
