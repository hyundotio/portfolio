import { WORK_DATA } from "@/content/work";
import { metadataBase } from "@/utils/metadata";
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = metadataBase.toString().replace(/\/$/, "");

  const workUrls = WORK_DATA.map((w) => ({
    url: `${baseUrl}/work/${w.id}`,
    lastModified: new Date(),
  }));

  return [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/contact`, lastModified: new Date() },
    { url: `${baseUrl}/resume`, lastModified: new Date() },
    ...workUrls,
  ];
}
