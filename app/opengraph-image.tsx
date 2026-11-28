import { intro, tagline } from "@/content/site";
import { ogContentType, ogSize, siteOgImage } from "@/utils/ogImage";

export const alt = "Hyun Seo: I design and build products for complex systems.";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return siteOgImage({ headline: intro, footer: tagline });
}
