"use client";

import Image from "next/image";
import styles from "./Resume.module.scss";

const resumePdfHref = "/assets/downloads/resume/resume.pdf";
const resumePages = [
  {
    src: "/assets/downloads/resume/resume_page_1.png",
    alt: "Preview of Hyun Seo resume page 1",
  },
  {
    src: "/assets/downloads/resume/resume_page_2.png",
    alt: "Preview of Hyun Seo resume page 2",
  },
];

export default function Resume() {
  return (
    <div className={styles["resume-container"]}>
      {resumePages.map((page, index) => (
        <a
          key={page.src}
          href={resumePdfHref}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open Hyun Seo resume PDF in a new tab from page ${index + 1}`}
          className={styles["preview-link"]}
        >
          <Image
            src={page.src}
            alt={page.alt}
            width={1224}
            height={1584}
            priority={index === 0}
            sizes="(max-width: 768px) 92vw, 760px"
            className={styles.preview}
          />
        </a>
      ))}
    </div>
  );
}
