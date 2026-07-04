import { WORK_DATA } from "@/content/work";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import WorkDetailContent from "./WorkDetailContent";
import { buildSocialMetadata } from "@/utils/metadata";

export async function generateStaticParams() {
  return WORK_DATA.map((work) => ({
    id: work.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const { id } = await params;
  const work = WORK_DATA.find((entry) => entry.id === id);

  if (!work) return { title: "Work Detail Not Found" };

  return {
    title: `${work.company} Case Study`,
    description: work.detailMetaDescription,
    ...buildSocialMetadata({
      title: `${work.company} Case Study`,
      description: work.detailMetaDescription,
      path: `/work/${work.id}/details`,
    }),
  };
}

export default async function WorkDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const work = WORK_DATA.find((entry) => entry.id === id);

  if (!work) notFound();

  return (
    <WorkDetailContent work={work} />
  );
}
