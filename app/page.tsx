import Link from "next/link";
import { WORK_DATA } from "@/content/work";
import {
  aboutParagraphs,
  intro,
  links,
  resumePdfHref,
} from "@/content/site";

export default function Home() {
  const [lead, ...about] = aboutParagraphs;

  return (
    <>
      <section className="page-head grid">
        <h1 className="display col-display reveal">
          {intro.replace(/\.$/, "")}
          <span className="accent">.</span>
        </h1>
        <p className="lead muted col-display prose reveal reveal-2">{lead}</p>
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
                  <p>
                    <strong>{work.company}</strong>
                  </p>
                  <p className="small muted">{work.years}</p>
                  <p className="small muted">{work.role}</p>
                </div>
                <div>
                  <h3>
                    <Link href={`/work/${work.id}`}>{work.heading}</Link>
                  </h3>
                  <p className="prose">{work.description}</p>
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
          {about.map((paragraph) => (
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
