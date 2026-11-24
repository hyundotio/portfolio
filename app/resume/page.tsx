import Image from "next/image";
import type { Metadata } from "next";
import { resumePdfHref } from "@/content/site";
import { buildSocialMetadata } from "@/utils/metadata";

const description =
  "Resume for Hyun Seo, design-led technical product builder across space systems, RF intelligence, AI, quantum, and geospatial data.";

export const metadata: Metadata = {
  title: "Resume",
  description,
  ...buildSocialMetadata({ title: "Resume", description, path: "/resume" }),
};

const pages = [
  "/assets/downloads/resume/resume_page_1.png",
  "/assets/downloads/resume/resume_page_2.png",
];

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
          {pages.map((src, i) => (
            <Image
              key={src}
              src={src}
              alt={`Hyun Seo resume, page ${i + 1}`}
              width={1224}
              height={1584}
              priority={i === 0}
              sizes="(max-width: 800px) 100vw, 720px"
            />
          ))}
        </div>
      </section>
    </>
  );
}
