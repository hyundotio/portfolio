import { tagline } from "@/content/site";
import { ogContentType, ogSize, siteOgImage } from "@/utils/ogImage";

export const alt = "Hyun Seo: get in touch";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return siteOgImage({ headline: "Get in touch", footer: tagline });
}
