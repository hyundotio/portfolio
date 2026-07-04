import { WORK_DATA } from "@/content/work";
import WorkOverlay from "@/Components/WorkOverlay";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Fragment } from "react/jsx-runtime";
import { buildSocialMetadata } from "@/utils/metadata";

// Pre-renders all work pages into static HTML at build time
export async function generateStaticParams() {
  return WORK_DATA.map((work) => ({
    id: work.id,
  }));
}

// Generates dynamic titles and descriptions for search engines
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const { id } = await params;
  const work = WORK_DATA.find((w) => w.id === id);

  if (!work) return { title: "Work Not Found" };

  return {
    title: work.company,
    description: work.metaDescription,
    ...buildSocialMetadata({
      title: work.company,
      description: work.metaDescription,
      path: `/work/${work.id}`,
    }),
  };
}

export default async function WorkPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const work = WORK_DATA.find((w) => w.id === id);

  if (!work) notFound();

  return (
    <Fragment>
      {/* Semantic hidden text for crawlers that struggle with JS overlays */}
      <section className="sr-only" style={{ display: "none" }}>
        <h1>{work.company}</h1>
        <h2>{work.heading}</h2>
        <p>{work.description}</p>
      </section>

      <WorkOverlay activeWork={work} isVisible={true} />
    </Fragment>
  );
}
