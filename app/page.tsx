import Link from "next/link";
import { WORK_DATA } from "@/content/work";
import {
  aboutParagraphs,
  intro,
  tagline,
  links,
  resumePdfHref,
} from "@/content/site";

export default function Home() {
  return (
    <>
      <section className="page-head home-head grid">
        <p className="name col-label reveal" aria-hidden="true">
          Hyun
          <br />
          Seo
        </p>
        <div className="col-wide">
          <h1 className="display reveal reveal-2">
            {intro.replace(/\.$/, "")}
            <span className="accent">.</span>
          </h1>
          <p className="tagline prose reveal reveal-3">{tagline}</p>
        </div>
      </section>

      <section id="work" className="section grid" aria-labelledby="work-title">
        <h2 id="work-title" className="col-label">
          Work
        </h2>
        <ol className="work-list col-wide">
          {WORK_DATA.map((work) => (
            <li key={work.id}>
              <article className="work-item">
                <div>
                  <p className="caps-label">{work.company}</p>
                  <p className="small muted">{work.years}</p>
                  <p className="small muted">{work.role}</p>
                </div>
                <div>
                  <h3>
                    <Link href={`/work/${work.id}`}>{work.heading}</Link>
                  </h3>
                  <p className="prose">{work.description}</p>
                  <span className="work-cta" aria-hidden="true">
                    Read case study <span className="arrow">→</span>
                  </span>
                </div>
              </article>
            </li>
          ))}
        </ol>
      </section>

      <section id="about" className="section grid" aria-labelledby="about-title">
        <h2 id="about-title" className="col-label">
          About
        </h2>
        <div className="col-text prose">
          {aboutParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="section grid" aria-labelledby="elsewhere-title">
        <h2 id="elsewhere-title" className="col-label">
          Elsewhere
        </h2>
        <ul className="col-text link-list">
          <li>
            <a href={resumePdfHref}>Resume (PDF)</a>
          </li>
          <li>
            <a href={links.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          </li>
          <li>
            <a href={links.scholar} target="_blank" rel="noreferrer">
              Google Scholar
            </a>
          </li>
          <li>
            <Link href="/contact">Send a message</Link>
          </li>
        </ul>
      </section>
    </>
  );
}
