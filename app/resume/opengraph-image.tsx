import { tagline } from "@/content/site";
import { ogContentType, ogSize, siteOgImage } from "@/utils/ogImage";

export const alt = "Hyun Seo: resume";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return siteOgImage({ headline: "Resume", footer: tagline });
}
