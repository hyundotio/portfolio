"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import TypewriterText from "@/Components/TypewriterText";
import { useRouteTransition } from "@/Components/RouteTransitionProvider";
import { WorkEntry } from "@/content/work";
import useTypewriterKickstart from "@/hooks/useTypewriterKickstart";
import styles from "./detailPage.module.scss";

const DETAIL_ENTRY_TRANSITION_MS = 760;
const DETAIL_TYPE_SPEED_MS = 5;
const DETAIL_COPY_SCRAMBLE_RESOLVE_MS = 60;
const DETAIL_SCRAMBLE_LEAD_WORD_COUNT = 6;
const HERO_DELAY_MS = 20;
const INTRO_DELAY_MS = 340;
const SIDEBAR_BLOCK_DELAY_MS = 120;
const SECTION_TITLE_DELAY_MS = 80;
const PARAGRAPH_STAGGER_MS = 120;
const HIGHLIGHT_STAGGER_MS = 140;
const MEDIA_VIEWER_MIN_SCALE = 1;
const MEDIA_VIEWER_MAX_SCALE = 5;
const MEDIA_VIEWER_EXIT_MS = 220;

interface WorkDetailContentProps {
  work: WorkEntry;
}

interface DetailSectionProps {
  enabled: boolean;
  section: WorkEntry["detailSections"][number];
}

interface SidebarTextBlockProps {
  enabled: boolean;
  title: string;
  text: string;
  delayMs?: number;
}

interface HighlightListItemProps {
  enabled: boolean;
  text: string;
  delayMs: number;
}

interface MediaCardGridProps {
  enabled: boolean;
  mediaCards: NonNullable<WorkEntry["detailSections"][number]["mediaCards"]>;
}

interface MediaCardProps {
  card: MediaCardGridProps["mediaCards"][number];
}

interface MediaViewerTransform {
  scale: number;
  x: number;
  y: number;
}

interface MediaViewerPoint {
  x: number;
  y: number;
}

interface MediaViewerGesture {
  startDistance: number;
  startTransform: MediaViewerTransform;
  startPoint: MediaViewerPoint;
  pinchContentPoint: MediaViewerPoint;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getDistance(first: MediaViewerPoint, second: MediaViewerPoint) {
  return Math.hypot(first.x - second.x, first.y - second.y);
}

function getMidpoint(first: MediaViewerPoint, second: MediaViewerPoint) {
  return {
    x: (first.x + second.x) / 2,
    y: (first.y + second.y) / 2,
  };
}

function isInternalHref(href: string) {
  return href.startsWith("/") || href.startsWith("#");
}

function useNearViewport<T extends HTMLElement>(rootMargin = "700px") {
  const ref = useRef<T | null>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element || isNearViewport) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      const fallbackTimer = globalThis.setTimeout(() => {
        setIsNearViewport(true);
      }, 0);

      return () => {
        globalThis.clearTimeout(fallbackTimer);
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }

        setIsNearViewport(true);
        observer.disconnect();
      },
      { rootMargin },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [isNearViewport, rootMargin]);

  return { ref, isNearViewport };
}

function MediaCard({ card }: MediaCardProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const pointersRef = useRef(new Map<number, MediaViewerPoint>());
  const gestureRef = useRef<MediaViewerGesture | null>(null);
  const mediaWidth = card.width ?? 1726;
  const mediaHeight = card.height ?? 939;
  const mediaAspectRatio = `${mediaWidth} / ${mediaHeight}`;
  const isVideo = card.isVideo || /\.mp4(?:[?#].*)?$/i.test(card.src);
  const { ref: lazyMediaRef, isNearViewport } = useNearViewport<HTMLElement>(
    isVideo ? "160px" : "650px",
  );
  const shouldAutostart = card.autostart ?? false;
  const subtitleLink =
    typeof card.subtitleLink === "string"
      ? {
          href: card.subtitleLink,
          text: card.subtitleLinkTitle ?? card.subtitle ?? card.subtitleLink,
        }
      : card.subtitleLink
        ? {
            ...card.subtitleLink,
            text: card.subtitleLinkTitle ?? card.subtitleLink.text,
          }
        : undefined;
  const shouldRenderSubtitle = card.subtitle && !subtitleLink;
  const isExternalSubtitleLink = subtitleLink
    ? !isInternalHref(subtitleLink.href)
    : false;
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isViewerClosing, setIsViewerClosing] = useState(false);
  const [transform, setTransform] = useState<MediaViewerTransform>({
    scale: MEDIA_VIEWER_MIN_SCALE,
    x: 0,
    y: 0,
  });

  const resetTransform = useCallback(() => {
    setTransform({ scale: MEDIA_VIEWER_MIN_SCALE, x: 0, y: 0 });
  }, []);

  const closeViewer = useCallback(() => {
    setIsViewerClosing(true);
    pointersRef.current.clear();
    gestureRef.current = null;

    window.setTimeout(() => {
      setIsViewerOpen(false);
      setIsViewerClosing(false);
      resetTransform();
    }, MEDIA_VIEWER_EXIT_MS);
  }, [resetTransform]);

  useEffect(() => {
    if (!isViewerOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.dataset.mediaViewerOpen = "true";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      closeViewer();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      delete document.body.dataset.mediaViewerOpen;
    };
  }, [closeViewer, isViewerOpen]);

  const beginGesture = useCallback(
    (points: MediaViewerPoint[]) => {
      if (points.length === 0) {
        gestureRef.current = null;
        return;
      }

      const viewerBounds = viewerRef.current?.getBoundingClientRect();
      const viewerCenter = viewerBounds
        ? {
            x: viewerBounds.left + viewerBounds.width / 2,
            y: viewerBounds.top + viewerBounds.height / 2,
          }
        : { x: 0, y: 0 };
      const startPoint =
        points.length > 1 ? getMidpoint(points[0], points[1]) : points[0];
      const pinchContentPoint = {
        x: (startPoint.x - viewerCenter.x - transform.x) / transform.scale,
        y: (startPoint.y - viewerCenter.y - transform.y) / transform.scale,
      };

      gestureRef.current = {
        startDistance:
          points.length > 1
            ? Math.max(1, getDistance(points[0], points[1]))
            : MEDIA_VIEWER_MIN_SCALE,
        startTransform: transform,
        startPoint,
        pinchContentPoint,
      };
    },
    [transform],
  );

  const handleViewerPointerDown = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
    beginGesture(Array.from(pointersRef.current.values()));
  };

  const handleViewerPointerMove = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    if (!pointersRef.current.has(event.pointerId) || !gestureRef.current) {
      return;
    }

    event.preventDefault();
    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    const points = Array.from(pointersRef.current.values());
    const gesture = gestureRef.current;

    if (points.length > 1) {
      const viewerBounds = viewerRef.current?.getBoundingClientRect();
      const viewerCenter = viewerBounds
        ? {
            x: viewerBounds.left + viewerBounds.width / 2,
            y: viewerBounds.top + viewerBounds.height / 2,
          }
        : { x: 0, y: 0 };
      const midpoint = getMidpoint(points[0], points[1]);
      const distance = getDistance(points[0], points[1]);
      const nextScale = clamp(
        gesture.startTransform.scale * (distance / gesture.startDistance),
        MEDIA_VIEWER_MIN_SCALE,
        MEDIA_VIEWER_MAX_SCALE,
      );

      setTransform({
        scale: nextScale,
        x:
          midpoint.x - viewerCenter.x - gesture.pinchContentPoint.x * nextScale,
        y:
          midpoint.y - viewerCenter.y - gesture.pinchContentPoint.y * nextScale,
      });
      return;
    }

    if (transform.scale <= MEDIA_VIEWER_MIN_SCALE) {
      return;
    }

    const point = points[0];
    setTransform({
      ...gesture.startTransform,
      x: gesture.startTransform.x + point.x - gesture.startPoint.x,
      y: gesture.startTransform.y + point.y - gesture.startPoint.y,
    });
  };

  const handleViewerPointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(event.pointerId);

    if (pointersRef.current.size === 0) {
      gestureRef.current = null;
      return;
    }

    beginGesture(Array.from(pointersRef.current.values()));
  };

  return (
    <article ref={lazyMediaRef} className={styles.mediaCard}>
      {card.title ? (
        <h4 className={styles.mediaCardTitle}>{card.title}</h4>
      ) : null}
      {!isNearViewport ? (
        <span
          className={`${styles.mediaCardImageFrame} ${styles.mediaCardPlaceholder}`}
          style={{ aspectRatio: mediaAspectRatio }}
          aria-hidden="true"
        />
      ) : isVideo ? (
        <span className={styles.mediaCardImageFrame}>
          <video
            className={styles.mediaCardImage}
            width={mediaWidth}
            height={mediaHeight}
            autoPlay={shouldAutostart}
            controls
            loop={card.loop}
            muted={shouldAutostart}
            playsInline
            preload="metadata"
            aria-label={card.alt}
          >
            <source src={card.src} type="video/mp4" />
          </video>
        </span>
      ) : (
        <button
          type="button"
          className={styles.mediaCardImageButton}
          onClick={() => {
            setIsViewerClosing(false);
            setIsViewerOpen(true);
          }}
          aria-label={`Open ${card.title ?? card.alt} fullscreen`}
        >
          <span className={styles.mediaCardImageFrame}>
            <Image
              src={card.src}
              alt={card.alt}
              width={mediaWidth}
              height={mediaHeight}
              className={styles.mediaCardImage}
              loading="lazy"
              sizes="(max-width: 780px) 100vw, (max-width: 1200px) 50vw, 42rem"
            />
          </span>
        </button>
      )}
      {shouldRenderSubtitle ? (
        <p className={styles.mediaCardSubtitle}>{card.subtitle}</p>
      ) : null}
      {subtitleLink ? (
        <a
          className={styles.mediaCardSubtitle}
          href={subtitleLink.href}
          target={isExternalSubtitleLink ? "_blank" : undefined}
          rel={isExternalSubtitleLink ? "noreferrer" : undefined}
        >
          {subtitleLink.text}
        </a>
      ) : null}

      {!isVideo && isViewerOpen
        ? createPortal(
            <div
              className={`${styles.mediaViewer} ${
                isViewerClosing ? styles["mediaViewer-closing"] : ""
              }`.trim()}
              role="dialog"
              aria-modal="true"
              aria-label={card.title ?? card.alt}
            >
              <button
                type="button"
                className={styles.mediaViewerClose}
                onClick={closeViewer}
                aria-label="Close fullscreen image"
              >
                <span aria-hidden="true" className={styles.modalCloseIcon} />
              </button>
              <div
                ref={viewerRef}
                className={styles.mediaViewerStage}
                onClick={(event) => {
                  if (event.target === event.currentTarget) {
                    closeViewer();
                  }
                }}
                onDoubleClick={resetTransform}
                onPointerDown={handleViewerPointerDown}
                onPointerMove={handleViewerPointerMove}
                onPointerUp={handleViewerPointerEnd}
                onPointerCancel={handleViewerPointerEnd}
                onPointerLeave={handleViewerPointerEnd}
              >
                <Image
                  src={card.src}
                  alt={card.alt}
                  width={mediaWidth}
                  height={mediaHeight}
                  className={styles.mediaViewerImage}
                  draggable={false}
                  priority
                  sizes="calc(100vw - 32px)"
                  style={{
                    width: `min(calc(100vw - 32px), calc((100dvh - 32px) * ${mediaWidth} / ${mediaHeight}))`,
                    transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})`,
                  }}
                />
              </div>
            </div>,
            document.body,
          )
        : null}
    </article>
  );
}

function MediaCardGrid({ enabled, mediaCards }: MediaCardGridProps) {
  const { ref, shouldType } = useTypewriterKickstart<HTMLDivElement>({
    enabled,
    rootMargin: "0px 0px -8% 0px",
  });
  const [hasAnimatedIn, setHasAnimatedIn] = useState(false);

  useEffect(() => {
    if (!shouldType || hasAnimatedIn) {
      return;
    }

    const timer = window.setTimeout(() => {
      setHasAnimatedIn(true);
    }, 80);

    return () => {
      window.clearTimeout(timer);
    };
  }, [hasAnimatedIn, shouldType]);

  return (
    <div
      ref={ref}
      className={`${styles.mediaCardGrid} ${
        hasAnimatedIn ? styles["mediaCardGrid-visible"] : ""
      }`.trim()}
    >
      {mediaCards.map((card) => (
        <MediaCard key={card.src} card={card} />
      ))}
    </div>
  );
}

function DetailSection({ enabled, section }: DetailSectionProps) {
  const { ref, shouldType } = useTypewriterKickstart<HTMLElement>({
    enabled,
    rootMargin: "0px 0px -12% 0px",
  });
  const isCollapsible = section.tertiary ?? false;
  const [isExpanded, setIsExpanded] = useState(
    !isCollapsible || (section.defaultExpanded ?? false),
  );
  const shouldRevealContent = !isCollapsible || isExpanded;
  const shouldAnimateContent = shouldType && shouldRevealContent;

  return (
    <article ref={ref} className={styles.section}>
      {isCollapsible ? (
        <h3 className={styles.sectionTitle}>
          <button
            type="button"
            className={styles.sectionToggle}
            onClick={() => setIsExpanded((current) => !current)}
            aria-expanded={isExpanded}
          >
            <span
              aria-hidden="true"
              className={`${styles.toggleMark} ${
                isExpanded ? styles["toggleMark-expanded"] : ""
              }`.trim()}
            >
              <span className={styles.toggleMarkHorizontal} />
              <span className={styles.toggleMarkVertical} />
            </span>
            <TypewriterText
              as="span"
              className={styles.sectionTitleText}
              text={section.title}
              speed={DETAIL_TYPE_SPEED_MS}
              shouldType={shouldType}
              delayMs={SECTION_TITLE_DELAY_MS}
              scrambleMode
              scrambleResolveMs={DETAIL_COPY_SCRAMBLE_RESOLVE_MS}
              scrambleLeadWordCount={DETAIL_SCRAMBLE_LEAD_WORD_COUNT}
            />
          </button>
        </h3>
      ) : (
        <TypewriterText
          as="h3"
          className={styles.sectionTitle}
          text={section.title}
          speed={DETAIL_TYPE_SPEED_MS}
          shouldType={shouldType}
          delayMs={SECTION_TITLE_DELAY_MS}
          scrambleMode
          scrambleResolveMs={DETAIL_COPY_SCRAMBLE_RESOLVE_MS}
          scrambleLeadWordCount={DETAIL_SCRAMBLE_LEAD_WORD_COUNT}
        />
      )}
      <div
        className={`${styles.sectionContent} ${
          shouldRevealContent ? styles["sectionContent-expanded"] : ""
        }`.trim()}
        aria-hidden={isCollapsible ? !isExpanded : undefined}
      >
        <div className={styles.sectionContentInner}>
          {section.body.map((paragraph, paragraphIndex) => (
            <TypewriterText
              key={`${section.title}-${paragraphIndex}`}
              as="p"
              className={styles.sectionParagraph}
              text={paragraph}
              speed={DETAIL_TYPE_SPEED_MS}
              shouldType={shouldAnimateContent}
              delayMs={
                SECTION_TITLE_DELAY_MS +
                120 +
                paragraphIndex * PARAGRAPH_STAGGER_MS
              }
              scrambleMode
              scrambleResolveMs={DETAIL_COPY_SCRAMBLE_RESOLVE_MS}
              scrambleLeadWordCount={DETAIL_SCRAMBLE_LEAD_WORD_COUNT}
            />
          ))}
          {section.mediaCards?.length ? (
            <MediaCardGrid
              enabled={enabled && shouldRevealContent}
              mediaCards={section.mediaCards}
            />
          ) : null}
        </div>
      </div>
    </article>
  );
}

function SidebarTextBlock({
  enabled,
  title,
  text,
  delayMs = SIDEBAR_BLOCK_DELAY_MS,
}: SidebarTextBlockProps) {
  const { ref, shouldType } = useTypewriterKickstart<HTMLDivElement>({
    enabled,
    rootMargin: "0px 0px -12% 0px",
  });

  return (
    <div ref={ref} className={styles.sidebarBlock}>
      <h4>{title}</h4>
      <TypewriterText
        as="p"
        className={styles.sidebarText}
        text={text}
        speed={DETAIL_TYPE_SPEED_MS}
        shouldType={shouldType}
        delayMs={delayMs}
        scrambleMode
        scrambleResolveMs={DETAIL_COPY_SCRAMBLE_RESOLVE_MS}
        scrambleLeadWordCount={DETAIL_SCRAMBLE_LEAD_WORD_COUNT}
      />
    </div>
  );
}

function HighlightListItem({ enabled, text, delayMs }: HighlightListItemProps) {
  const { ref, shouldType } = useTypewriterKickstart<HTMLLIElement>({
    enabled,
    rootMargin: "0px 0px -10% 0px",
  });

  return (
    <li ref={ref}>
      <TypewriterText
        listMode
        as="span"
        className={styles.highlightItem}
        text={text}
        speed={DETAIL_TYPE_SPEED_MS}
        shouldType={shouldType}
        delayMs={delayMs}
        scrambleMode
        scrambleResolveMs={DETAIL_COPY_SCRAMBLE_RESOLVE_MS}
        scrambleLeadWordCount={DETAIL_SCRAMBLE_LEAD_WORD_COUNT}
      />
    </li>
  );
}

export default function WorkDetailContent({ work }: WorkDetailContentProps) {
  const router = useRouter();
  const { activeTransition, startTransition } = useRouteTransition();
  const [enteredFromOverview] = useState(
    () => activeTransition?.mode === "to-detail",
  );
  const [entryElapsedMs] = useState(() => {
    if (activeTransition?.mode !== "to-detail") {
      return 0;
    }

    return Math.max(0, Date.now() - activeTransition.startedAt);
  });
  const [remainingEntryMotionMs] = useState(() => {
    if (activeTransition?.mode !== "to-detail") {
      return 0;
    }

    return Math.max(0, DETAIL_ENTRY_TRANSITION_MS - entryElapsedMs);
  });
  const [isEntryMotionActive, setIsEntryMotionActive] =
    useState(enteredFromOverview);
  const [isExitMotionActive, setIsExitMotionActive] = useState(false);
  const { ref: introTypewriterRef, shouldType: shouldTypeIntro } =
    useTypewriterKickstart<HTMLDivElement>({
      enabled: !isEntryMotionActive,
      rootMargin: "0px 0px -18% 0px",
    });
  const overviewHref = `/work/${work.id}`;
  const entryMotionStyle = enteredFromOverview
    ? ({
        ["--detail-entry-delay" as string]: `${Math.max(
          0,
          120 - entryElapsedMs,
        )}ms`,
        ["--detail-hero-delay" as string]: `${Math.max(
          0,
          220 - entryElapsedMs,
        )}ms`,
      } as CSSProperties)
    : undefined;

  useEffect(() => {
    router.prefetch(overviewHref);
  }, [overviewHref, router]);

  const navigateToOverview = useCallback(() => {
    if (isExitMotionActive) {
      return;
    }

    window.scrollTo(0, 0);
    const transitionPlan = startTransition(overviewHref);

    if (!transitionPlan) {
      router.push(overviewHref);
      return;
    }

    setIsExitMotionActive(true);

    window.setTimeout(() => {
      router.push(overviewHref);
    }, transitionPlan.navigationDelayMs);
  }, [isExitMotionActive, overviewHref, router, startTransition]);

  useEffect(() => {
    if (!enteredFromOverview) {
      return;
    }

    const entryMotionMs = Math.max(720, remainingEntryMotionMs);
    const motionTimer = window.setTimeout(() => {
      setIsEntryMotionActive(false);
    }, entryMotionMs);

    return () => {
      window.clearTimeout(motionTimer);
    };
  }, [enteredFromOverview, entryElapsedMs, remainingEntryMotionMs]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (document.body.dataset.mediaViewerOpen === "true") {
          return;
        }

        event.preventDefault();
        navigateToOverview();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigateToOverview]);

  return (
    <section className={styles.page} style={entryMotionStyle}>
      <div
        className={`${styles.contentShell} ${
          isEntryMotionActive ? styles["entry-motion"] : ""
        } ${isExitMotionActive ? styles["content-shell-exiting"] : ""}`.trim()}
      >
        <div ref={introTypewriterRef} className={styles.introBlock}>
          <span className={styles.kicker}>Case study</span>
          <TypewriterText
            as="h1"
            className={styles.heroTitle}
            text={work.company}
            speed={DETAIL_TYPE_SPEED_MS}
            shouldType={shouldTypeIntro}
            delayMs={HERO_DELAY_MS}
          />
          <div className={styles["intro-summary"]}>
            <TypewriterText
              as="p"
              className={styles.intro}
              text={work.description}
              speed={DETAIL_TYPE_SPEED_MS}
              shouldType={shouldTypeIntro}
              delayMs={INTRO_DELAY_MS}
              scrambleMode
              scrambleResolveMs={DETAIL_COPY_SCRAMBLE_RESOLVE_MS}
              scrambleLeadWordCount={DETAIL_SCRAMBLE_LEAD_WORD_COUNT}
            />
          </div>
        </div>

        <div aria-hidden="true" className={styles.canvasSlot} />

        <div className={styles.grid}>
          <div className={styles.mainColumn}>
            {work.detailSections.map((section) => (
              <DetailSection
                key={section.title}
                enabled={!isEntryMotionActive}
                section={section}
              />
            ))}
          </div>

          <aside className={styles.sidebar}>
            <div className={styles.sidebarInner}>
              <SidebarTextBlock
                enabled={!isEntryMotionActive}
                title="Role arc"
                text={`${work.periodPrefix}${work.periodHighlight}`}
              />
              <div className={styles.sidebarBlock}>
                <TypewriterText
                  as="h4"
                  className={styles.heroHeading}
                  text={work.heading}
                  speed={DETAIL_TYPE_SPEED_MS}
                  shouldType={!isEntryMotionActive}
                  delayMs={SIDEBAR_BLOCK_DELAY_MS + 80}
                  scrambleMode
                  scrambleResolveMs={DETAIL_COPY_SCRAMBLE_RESOLVE_MS}
                  scrambleLeadWordCount={DETAIL_SCRAMBLE_LEAD_WORD_COUNT}
                />
                <TypewriterText
                  as="p"
                  className={styles.sidebarText}
                  text={work.detailIntro}
                  speed={DETAIL_TYPE_SPEED_MS}
                  shouldType={!isEntryMotionActive}
                  delayMs={SIDEBAR_BLOCK_DELAY_MS + 160}
                  scrambleMode
                  scrambleResolveMs={DETAIL_COPY_SCRAMBLE_RESOLVE_MS}
                  scrambleLeadWordCount={DETAIL_SCRAMBLE_LEAD_WORD_COUNT}
                />
              </div>

              <div className={styles.sidebarBlock}>
                <h4>Highlights</h4>
                <ul className={styles.highlightList}>
                  {work.highlights.map((highlight, index) => (
                    <HighlightListItem
                      key={highlight}
                      enabled={!isEntryMotionActive}
                      text={highlight}
                      delayMs={
                        SIDEBAR_BLOCK_DELAY_MS + index * HIGHLIGHT_STAGGER_MS
                      }
                    />
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
