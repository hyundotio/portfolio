"use client";
// TypewriterText.tsx

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "@/Components/TypewriterText.module.scss";

const DEFAULT_SCRAMBLE_RESOLVE_MS = 600;
const SCRAMBLE_LEAD_WORD_COUNT = 3;
const SCRAMBLE_REVEAL_SPEED_MULTIPLIER = 0.45;
const SCRAMBLE_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

interface DisplaySegment {
  text: string;
  isScrambled: boolean;
}

const scrambleSegment = (segment: string) =>
  segment
    .split("")
    .map((character) => {
      if (/\s/.test(character)) {
        return character;
      }

      return SCRAMBLE_CHARACTERS[
        Math.floor(Math.random() * SCRAMBLE_CHARACTERS.length)
      ];
    })
    .join("");

const buildScrambleDisplaySegments = (
  text: string,
  typedLength: number,
  resolvedWordEnds: Set<number>,
) => {
  const visibleText = text.slice(0, typedLength);
  const isFullyTyped = typedLength >= text.length;
  const segments: DisplaySegment[] = [];
  let cursor = 0;

  visibleText.replace(/\S+/g, (word, offset) => {
    if (offset > cursor) {
      segments.push({
        text: visibleText.slice(cursor, offset),
        isScrambled: false,
      });
    }

    const wordEnd = offset + word.length;
    const shouldScramble =
      (!isFullyTyped && wordEnd === typedLength) ||
      !resolvedWordEnds.has(wordEnd);

    segments.push({
      text: shouldScramble ? scrambleSegment(word) : word,
      isScrambled: shouldScramble,
    });

    cursor = wordEnd;
    return word;
  });

  if (cursor < visibleText.length) {
    segments.push({
      text: visibleText.slice(cursor),
      isScrambled: false,
    });
  }

  return segments;
};

const getNextWordEnd = (text: string, currentIndex: number) => {
  if (currentIndex >= text.length) {
    return text.length;
  }

  let nextIndex = currentIndex;

  while (nextIndex < text.length && /\s/.test(text[nextIndex])) {
    nextIndex++;
  }

  while (nextIndex < text.length && !/\s/.test(text[nextIndex])) {
    nextIndex++;
  }

  return nextIndex;
};

const getLeadWordEnd = (
  text: string,
  currentIndex: number,
  wordCount: number,
) => {
  let nextIndex = currentIndex;

  for (let count = 0; count < wordCount; count++) {
    const wordEnd = getNextWordEnd(text, nextIndex);

    if (wordEnd === nextIndex) {
      break;
    }

    nextIndex = wordEnd;
  }

  return nextIndex;
};

const getNextResolvableWordEnd = (
  text: string,
  visibleLength: number,
  resolvedWordEnds: Set<number>,
) => {
  let cursor = 0;

  while (cursor < visibleLength) {
    const wordEnd = getNextWordEnd(text, cursor);

    if (wordEnd === cursor) {
      break;
    }

    if (wordEnd <= visibleLength && !resolvedWordEnds.has(wordEnd)) {
      return wordEnd;
    }

    cursor = wordEnd;
  }

  return null;
};

const useTypewriter = (
  text: string,
  speed: number | undefined,
  shouldType: boolean,
  paused: boolean,
  delayMs: number,
  scrambleMode: boolean,
  scrambleResolveMs: number,
  scrambleLeadWordCount: number,
) => {
  const [displayedText, setDisplayedText] = useState("");
  const [displaySegments, setDisplaySegments] = useState<DisplaySegment[]>([]);
  const [isDelayed, setIsDelayed] = useState(true);
  const index = useRef(0);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resolvedWordEndsRef = useRef<Set<number>>(new Set());

  const syncDisplayedText = useCallback(
    (typedLength: number) => {
      if (typedLength >= text.length) {
        setDisplayedText(text);
        setDisplaySegments([{ text, isScrambled: false }]);
        return;
      }

      if (scrambleMode) {
        const nextSegments = buildScrambleDisplaySegments(
          text,
          typedLength,
          resolvedWordEndsRef.current,
        );
        setDisplayedText(nextSegments.map((segment) => segment.text).join(""));
        setDisplaySegments(nextSegments);
        return;
      }

      const visibleText = text.slice(0, typedLength);
      setDisplayedText(visibleText);
      setDisplaySegments([{ text: visibleText, isScrambled: false }]);
    },
    [scrambleMode, text],
  );

  // 1. Reset / Initialization Logic
  useEffect(() => {
    let resetTimer: NodeJS.Timeout | undefined;

    // Only reset when we are STARTING to type.
    // If we are stopping (shouldType = false), we skip this
    // so the text remains visible for the "untyping" animation to consume.
    if (shouldType) {
      index.current = 0;
      resetTimer = setTimeout(() => {
        if (animationTimeoutRef.current) {
          clearTimeout(animationTimeoutRef.current);
          animationTimeoutRef.current = null;
        }
        resolvedWordEndsRef.current.clear();
        setDisplayedText("");
        setDisplaySegments([]);
        setIsDelayed(delayMs > 0);
      }, 0);
    }

    return () => {
      clearTimeout(resetTimer);
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
        animationTimeoutRef.current = null;
      }
    };
  }, [text, shouldType, delayMs]);

  // 2. Handle Delay Timer
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    if (paused) {
      return () => clearTimeout(timer);
    }

    if (shouldType) {
      timer = setTimeout(() => {
        setIsDelayed(false);
      }, delayMs);
    } else if (!shouldType) {
      timer = setTimeout(() => {
        setIsDelayed(false);
      }, 0);
    }
    return () => clearTimeout(timer);
  }, [shouldType, paused, delayMs]);

  // 3. Typing / Untyping Animation Loop
  useEffect(() => {
    if (paused) return;
    if (isDelayed) return;

    // Calculate speed
    let intervalDelay = speed;
    if (intervalDelay === undefined) {
      const TARGET_DURATION = 1300;
      intervalDelay = TARGET_DURATION / (text.length || 1);
    }

    // Untyping Speed Adjustment
    if (!shouldType) {
      intervalDelay = Math.max(2, intervalDelay / 10);
    }

    const scrambleRevealDelay = Math.max(
      16,
      Math.round(intervalDelay * SCRAMBLE_REVEAL_SPEED_MULTIPLIER),
    );

    const tick = () => {
      if (shouldType) {
        // TYPING
        if (index.current < text.length) {
          if (scrambleMode) {
            if (index.current === 0 && resolvedWordEndsRef.current.size === 0) {
              index.current = getLeadWordEnd(
                text,
                index.current,
                scrambleLeadWordCount,
              );
              syncDisplayedText(index.current);
              animationTimeoutRef.current = setTimeout(tick, scrambleResolveMs);
              return;
            }

            const nextResolvableWordEnd = getNextResolvableWordEnd(
              text,
              index.current,
              resolvedWordEndsRef.current,
            );

            if (nextResolvableWordEnd === null) {
              setDisplayedText(text);
              setDisplaySegments([{ text, isScrambled: false }]);
              return;
            }

            resolvedWordEndsRef.current.add(nextResolvableWordEnd);
            syncDisplayedText(index.current);

            if (index.current >= text.length) {
              const hasRemainingVisibleBarcode =
                getNextResolvableWordEnd(
                  text,
                  index.current,
                  resolvedWordEndsRef.current,
                ) !== null;

              if (!hasRemainingVisibleBarcode) {
                setDisplayedText(text);
                setDisplaySegments([{ text, isScrambled: false }]);
                return;
              }
            }

            const nextVisibleLength = getNextWordEnd(text, index.current);

            if (nextVisibleLength > index.current) {
              animationTimeoutRef.current = setTimeout(() => {
                index.current = nextVisibleLength;
                syncDisplayedText(index.current);
                animationTimeoutRef.current = setTimeout(
                  tick,
                  scrambleResolveMs,
                );
              }, scrambleRevealDelay);
              return;
            }

            animationTimeoutRef.current = setTimeout(tick, scrambleResolveMs);
            return;
          }

          index.current = index.current + 1;
          const nextTypedLength = index.current;
          syncDisplayedText(nextTypedLength);
          animationTimeoutRef.current = setTimeout(tick, intervalDelay);
        } else {
          setDisplayedText(text);
          setDisplaySegments([{ text, isScrambled: false }]);
        }
      } else {
        // UNTYPING
        if (index.current > 0) {
          index.current = Math.max(0, index.current - 2);
          // Important: We slice the CURRENT 'text' prop.
          // Even if text changed, we just want to clear the screen.
          const visibleText = text.slice(0, index.current);
          setDisplayedText(visibleText);
          setDisplaySegments([{ text: visibleText, isScrambled: false }]);
          animationTimeoutRef.current = setTimeout(tick, intervalDelay);
        } else {
          setDisplayedText("");
          setDisplaySegments([]);
        }
      }
    };

    tick();
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
        animationTimeoutRef.current = null;
      }
    };
  }, [
    text,
    speed,
    shouldType,
    paused,
    isDelayed,
    scrambleMode,
    scrambleResolveMs,
    scrambleLeadWordCount,
    syncDisplayedText,
  ]);

  return { displayedText, displaySegments };
};

interface TypewriterProps {
  text: string;
  as?: React.ElementType<{ className?: string; children?: React.ReactNode }>;
  className?: string;
  speed?: number;
  shouldType?: boolean;
  paused?: boolean;
  listMode?: boolean;
  delayMs?: number;
  cursor?: boolean;
  scrambleMode?: boolean;
  scrambleResolveMs?: number;
  scrambleLeadWordCount?: number;
}

const TypewriterText = ({
  text,
  as: Tag = "p",
  className = "",
  speed,
  shouldType = true,
  paused = false,
  listMode = false,
  delayMs = 0,
  cursor = false,
  scrambleMode = false,
  scrambleResolveMs = DEFAULT_SCRAMBLE_RESOLVE_MS,
  scrambleLeadWordCount = SCRAMBLE_LEAD_WORD_COUNT,
}: TypewriterProps) => {
  const { displayedText: typed, displaySegments } = useTypewriter(
    text,
    speed,
    shouldType,
    paused,
    delayMs,
    scrambleMode,
    scrambleResolveMs,
    scrambleLeadWordCount,
  );
  const isBulletVisible = typed.length > 0;
  const showCursor = cursor && shouldType && typed === text;

  const TextContent = (
    <>
      <span className={styles.ghost} aria-hidden="true">
        {text}
      </span>
      <span className={styles.typed}>
        {displaySegments.map((segment, index) => (
          <span
            key={`${segment.text}-${index}`}
            className={styles.segment}
          >
            {segment.text}
          </span>
        ))}
        {showCursor ? (
          <span className={styles.cursor} aria-hidden="true">
            |
          </span>
        ) : null}
      </span>
    </>
  );

  if (listMode) {
    return (
      <Tag className={`${styles["list-container"]} ${className || ""}`}>
        <span
          className={`${styles.bullet} ${!isBulletVisible ? styles["bullet-hidden"] : ""}`}
        >
          •
        </span>
        <div className={styles["text-wrapper"]}>{TextContent}</div>
      </Tag>
    );
  }

  return (
    <Tag className={`${styles.container} ${className || ""}`}>
      {TextContent}
    </Tag>
  );
};

export default TypewriterText;
