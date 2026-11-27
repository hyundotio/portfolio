import Image from "next/image";
import type { Metadata } from "next";
import { resumePdfHref } from "@/content/site";
import { buildSocialMetadata } from "@/utils/metadata";
import { MediaOpen, MediaViewer } from "@/app/_components/MediaViewer";

const description =
  "Resume for Hyun Seo, product engineer and designer across space systems, RF intelligence, AI, quantum, and geospatial data.";

export const metadata: Metadata = {
  title: "Resume",
  description,
  ...buildSocialMetadata({ title: "Resume", description, path: "/resume" }),
};

const pages = [1, 2].map((n) => ({
  src: `/assets/downloads/resume/resume_page_${n}.png`,
  alt: `Hyun Seo resume, page ${n}`,
  title: `Page ${n}`,
  width: 1224,
  height: 1584,
}));

export default function ResumePage() {
  return (
    <>
      <header className="page-head grid">
        <h1 className="display col-display">Resume</h1>
      </header>

      <section className="section grid" aria-label="Resume">
        <p className="col-label">
          <a href={resumePdfHref}>Download PDF</a>
        </p>
        <div className="col-text resume-pages">
          <MediaViewer items={pages}>
            {pages.map((page, i) => (
              <MediaOpen key={page.src} index={i} label={`View ${page.alt} larger`}>
                <Image
                  src={page.src}
                  alt={page.alt}
                  width={page.width}
                  height={page.height}
                  priority={i === 0}
                  sizes="(max-width: 800px) 100vw, 720px"
                />
              </MediaOpen>
            ))}
          </MediaViewer>
        </div>
      </section>
    </>
  );
}
