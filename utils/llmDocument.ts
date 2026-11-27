import { keyFacts, llmNote, resumeFacts, threads } from "@/content/llm";
import { aboutParagraphs, links, resumePdfHref, tagline } from "@/content/site";
import {
  WORK_DATA,
  type WorkDetailMediaCard,
  type WorkEntry,
} from "@/content/work";
import { metadataBase } from "@/utils/metadata";
import { slugify } from "@/utils/slugify";

const base = metadataBase.toString().replace(/\/$/, "");
const works: readonly WorkEntry[] = WORK_DATA;

const workUrl = (work: WorkEntry) => `${base}/work/${work.id}`;
const sectionUrl = (work: WorkEntry, title: string) =>
  `${workUrl(work)}#${slugify(title)}`;
const bullets = (items: readonly string[]) =>
  items.map((item) => `- ${item}`).join("\n");

// Only the cards that point somewhere: patents, press, live products.
function cardLink(card: WorkDetailMediaCard) {
  if (!card.subtitleLink) return null;
  const href =
    typeof card.subtitleLink === "string"
      ? card.subtitleLink
      : card.subtitleLink.href;
  const text =
    typeof card.subtitleLink === "string"
      ? card.subtitleLinkTitle
      : card.subtitleLink.text;
  return `- ${[card.title, text].filter(Boolean).join(": ")} ${href}`;
}

function threadBlock(thread: (typeof threads)[number]) {
  const refs = thread.sections.map(({ work: id, title }) => {
    const work = works.find((w) => w.id === id);
    if (!work?.detailSections.some((s) => s.title === title)) {
      throw new Error(
        `content/llm.ts points at a section that no longer exists: ${id} / ${title}`,
      );
    }
    return `- ${work.company}: ${title} ${sectionUrl(work, title)}`;
  });
  return [`### ${thread.question}`, thread.note, refs.join("\n")].join("\n\n");
}

function workBlock(work: WorkEntry) {
  const meta = [
    `Role: ${work.role}`,
    `Period: ${work.periodPrefix}${work.periodHighlight}`,
    `Case study: ${workUrl(work)}`,
    ...(work.links ?? []).map((link) => `${link.label}: ${link.href}`),
  ];

  const sections = work.detailSections.map((section) => {
    const cards = (section.mediaCards ?? []).map(cardLink).filter(Boolean);
    return [
      `#### ${section.title}`,
      sectionUrl(work, section.title),
      ...section.body,
      ...(cards.length ? [`Links:\n${cards.join("\n")}`] : []),
    ].join("\n\n");
  });

  return [
    `### ${work.company}: ${work.heading}`,
    bullets(meta),
    work.description,
    work.detailIntro,
    `Highlights:\n${bullets(work.highlights)}`,
    ...sections,
  ].join("\n\n");
}

/** The whole site as one Markdown document, for pasting into an assistant. */
export function buildLlmDocument() {
  return [
    "# Hyun Seo",
    `> ${tagline}`,
    "## How to read this",
    ...llmNote,
    "## Key facts",
    bullets(keyFacts),
    "## Where to look, by question",
    ...threads.map(threadBlock),
    "## About",
    ...aboutParagraphs,
    "## Work",
    ...works.map(workBlock),
    "## Also on the resume",
    bullets(resumeFacts),
    "## Links",
    bullets([
      `Site: ${base}`,
      `Resume (PDF): ${base}${resumePdfHref}`,
      `Contact: ${base}/contact`,
      `LinkedIn: ${links.linkedin}`,
      `GitHub: ${links.github}`,
      `Google Scholar: ${links.scholar}`,
    ]),
  ].join("\n\n");
}
