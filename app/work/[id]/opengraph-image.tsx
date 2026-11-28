import { WORK_DATA } from "@/content/work";
import { ogContentType, ogSize, workOgImage } from "@/utils/ogImage";

export const size = ogSize;
export const contentType = ogContentType;
export const dynamicParams = false;

export function generateStaticParams() {
  return WORK_DATA.map((w) => ({ id: w.id }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const work = WORK_DATA.find((w) => w.id === id)!;
  return workOgImage({
    company: work.company,
    color: "accentOnLight" in work ? work.accentOnLight : work.accent,
    heading: work.heading,
    years: work.years,
  });
}
