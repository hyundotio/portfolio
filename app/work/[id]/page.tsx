import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { WORK_DATA, type WorkDetailMediaCard } from "@/content/work";
import { buildSocialMetadata } from "@/utils/metadata";
import { slugify } from "@/utils/slugify";
import { MediaOpen, MediaViewer, type ViewerItem } from "@/app/_components/MediaViewer";
import Wordmark from "@/app/_components/Wordmark";

type Params = Promise<{ id: string }>;

export function generateStaticParams() {
  return WORK_DATA.map((work) => ({ id: work.id }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  const work = WORK_DATA.find((w) => w.id === id);
  if (!work) return {};

  return {
    title: work.company,
    description: work.detailMetaDescription,
    ...buildSocialMetadata({
      title: work.company,
      description: work.detailMetaDescription,
      path: `/work/${work.id}`,
    }),
  };
}

function linkLabel(href: string) {
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return href;
  }
}

function cardLink(card: WorkDetailMediaCard) {
  if (typeof card.subtitleLink === "string") {
    return {
      href: card.subtitleLink,
      text: card.subtitleLinkTitle ?? linkLabel(card.subtitleLink),
    };
  }
  return card.subtitleLink ?? null;
}

function toViewerItem(card: WorkDetailMediaCard): ViewerItem {
  return {
    src: card.src,
    alt: card.alt,
    width: card.width ?? 1920,
    height: card.height ?? 1080,
    isVideo: card.isVideo,
    title: card.title,
    subtitle: card.subtitle,
    link: cardLink(card),
  };
}

function MediaFigure({ item, index }: { item: ViewerItem; index: number }) {
  const label = `View ${item.title ?? "image"} larger`;

  return (
    <figure>
      {item.isVideo ? (
        <video
          src={`${item.src}#t=0.1`}
          width={item.width}
          height={item.height}
          controls
          muted
          playsInline
          preload="metadata"
          aria-label={item.alt}
        />
      ) : (
        <MediaOpen index={index} label={label}>
          <Image
            src={item.src}
            alt={item.alt}
            width={item.width}
            height={item.height}
            sizes="(max-width: 800px) 100vw, 460px"
          />
        </MediaOpen>
      )}
      <figcaption className="small muted">
        {item.title && <span className="fig-title">{item.title}</span>}
        {item.title && item.subtitle && ". "}
        {item.subtitle}
        <span className="fig-links">
          {item.link && (
            <a href={item.link.href} target="_blank" rel="noreferrer">
              {item.link.text}
            </a>
          )}
          {item.isVideo && (
            <MediaOpen index={index} label={label} className="text-button">
              View larger
            </MediaOpen>
          )}
        </span>
      </figcaption>
    </figure>
  );
}

export default async function WorkPage({ params }: { params: Params }) {
  const { id } = await params;
  const index = WORK_DATA.findIndex((w) => w.id === id);
  if (index === -1) notFound();

  const work = WORK_DATA[index];
  const next = WORK_DATA[(index + 1) % WORK_DATA.length];

  // One flat list so the viewer can step through every item on the page.
  const sections = work.detailSections.map((section) => {
    const cards: readonly WorkDetailMediaCard[] =
      "mediaCards" in section ? section.mediaCards : [];
    return { section, cards };
  });
  const viewerItems = sections.flatMap(({ cards }) => cards.map(toViewerItem));
  let viewerIndex = 0;

  // The wordmark takes the company's logo color (see .work in globals.css).
  const accentStyle = {
    "--work-accent": work.accent,
    "--work-accent-on-light":
      "accentOnLight" in work ? work.accentOnLight : work.accent,
  } as React.CSSProperties;

  return (
    <article className="work" style={accentStyle}>
      <header className="work-hero">
        <div className="hero-meta grid small">
          <p className="col-label">
            <Link href="/#work">Work</Link>
            <br />
            <span className="muted">
              {String(index + 1).padStart(2, "0")} of{" "}
              {String(WORK_DATA.length).padStart(2, "0")}
            </span>
          </p>
          <p className="hero-cell-a">
            Role
            <br />
            <span className="muted">{work.role}</span>
          </p>
          <p className="hero-cell-b">
            Period
            <br />
            <span className="muted">
              {work.periodPrefix}
              {work.periodHighlight}
            </span>
          </p>
          {"links" in work && work.links && (
            <div className="hero-cell-c">
              Links
              <ul>
                {work.links.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} target="_blank" rel="noreferrer">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="hero-mark grid" aria-hidden="true">
          <div className="col-full">
            <Wordmark text={work.company} />
          </div>
        </div>
        <div className="grid">
          <h1 className="display hero-statement col-display">
            <span className="sr-only">{work.company}: </span>
            {work.heading}
          </h1>
        </div>
      </header>

      <section className="section grid" aria-labelledby="overview">
        <h2 id="overview" className="col-label">
          Overview
        </h2>
        <p className="col-text lead prose">{work.detailIntro}</p>
      </section>

      <section className="section grid" aria-labelledby="highlights">
        <h2 id="highlights" className="col-label">
          Highlights
        </h2>
        <ul className="col-text bullets prose">
          {work.highlights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <MediaViewer items={viewerItems}>
        {sections.map(({ section, cards }) => {
          const sectionId = slugify(section.title);

          return (
            <section
              key={section.title}
              className="section grid"
              aria-labelledby={sectionId}
            >
              <h2 id={sectionId} className="col-label">
                {section.title}
              </h2>
              <div className="col-text prose">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              {cards.length > 0 && (
                <div className="col-wide media">
                  {cards.map((card) => {
                    const i = viewerIndex++;
                    return (
                      <MediaFigure
                        key={card.src}
                        item={viewerItems[i]}
                        index={i}
                      />
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </MediaViewer>

      <nav className="section grid" aria-label="Next case study">
        <p className="col-label muted">Next</p>
        <div className="col-wide">
          <p className="lead">
            <Link href={`/work/${next.id}`}>
              {next.company}: {next.heading}
            </Link>
          </p>
        </div>
      </nav>
    </article>
  );
}
