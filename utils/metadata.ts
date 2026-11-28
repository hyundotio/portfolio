import type { Metadata } from "next";
import { tagline } from "@/content/site";

export const siteName = "Hyun Seo";
export const siteTitle = "Hyun Seo, product engineer and designer";
export const siteTitleTemplate = "%s | Hyun Seo";
// The resume tagline, so search results read the same as the resume.
export const siteDescription = `Hyun Seo is a ${tagline.charAt(0).toLowerCase()}${tagline.slice(1)}`;

export const metadataBase = new URL(
  // hyun.io redirects here, so canonical and share URLs use the final address.
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.hyun.io"
);

/**
 * Canonical URL plus Open Graph and Twitter tags for one page. The share
 * image comes from the nearest opengraph-image file (app/opengraph-image.tsx,
 * or the case study's own), so none is set here.
 */
export function buildSocialMetadata({
  title,
  description,
  path = "/",
  type = "website",
  useTitleTemplate = true,
}: {
  title: string;
  description: string;
  path?: string;
  type?: "website" | "article" | "profile";
  useTitleTemplate?: boolean;
}): Pick<Metadata, "alternates" | "openGraph" | "twitter"> {
  const socialTitle = useTitleTemplate ? `${title} | Hyun Seo` : title;

  return {
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: socialTitle,
      description,
      url: path,
      siteName,
      locale: "en_US",
      type,
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
    },
  };
}
