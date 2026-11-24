import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { WORK_DATA, type WorkDetailMediaCard } from "@/content/work";
import { buildSocialMetadata } from "@/utils/metadata";

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

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function linkLabel(href: string) {
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return href;
  }
}

function MediaFigure({ card }: { card: WorkDetailMediaCard }) {
  const width = card.width ?? 1920;
  const height = card.height ?? 1080;
  const link =
    typeof card.subtitleLink === "string"
      ? { href: card.subtitleLink, text: card.subtitleLinkTitle }
      : card.subtitleLink
        ? { href: card.subtitleLink.href, text: card.subtitleLink.text }
        : null;

  return (
    <figure>
      {card.isVideo ? (
        <video
          src={`${card.src}#t=0.1`}
          width={width}
          height={height}
          controls
          muted
          playsInline
          preload="metadata"
          aria-label={card.alt}
        />
      ) : (
        <a href={card.src} aria-label={`${card.title ?? "Image"}, full size`}>
          <Image
            src={card.src}
            alt={card.alt}
            width={width}
            height={height}
            sizes="(max-width: 800px) 100vw, 460px"
          />
        </a>
      )}
      {(card.title || card.subtitle || link) && (
        <figcaption className="small muted">
          {card.title && <span className="fig-title">{card.title}</span>}
          {card.subtitle && (
            <>
              {card.title && ". "}
              {card.subtitle}
            </>
          )}
          {link && (
            <>
              {(card.title || card.subtitle) && <br />}
              <a href={link.href} target="_blank" rel="noreferrer">
                {link.text ?? linkLabel(link.href)}
              </a>
            </>
          )}
        </figcaption>
      )}
    </figure>
  );
}

export default async function WorkPage({ params }: { params: Params }) {
  const { id } = await params;
  const index = WORK_DATA.findIndex((w) => w.id === id);
  if (index === -1) notFound();

  const work = WORK_DATA[index];
  const next = WORK_DATA[(index + 1) % WORK_DATA.length];

  return (
    <article>
      <header className="page-head grid">
        <p className="col-full muted">
          <Link href="/#work">Work</Link> / {work.company}
        </p>
        <h1 className="display col-display">{work.heading}</h1>
      </header>

      <section className="section grid" aria-label="Overview">
        <dl className="col-label meta small">
          <dt>Company</dt>
          <dd>{work.company}</dd>
          <dt>Period</dt>
          <dd>
            {work.periodPrefix}
            {work.periodHighlight}
          </dd>
        </dl>
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

      {work.detailSections.map((section) => {
        const sectionId = slugify(section.title);
        const media = "mediaCards" in section ? section.mediaCards : undefined;

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
            {media && media.length > 0 && (
              <div className="col-wide media">
                {media.map((card) => (
                  <MediaFigure key={card.src} card={card} />
                ))}
              </div>
            )}
          </section>
        );
      })}

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
