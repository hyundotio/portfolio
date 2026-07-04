import type { Metadata } from "next";

export const siteName = "Hyun.io";
export const siteTitle = "Hyun Seo | Design-Led Technical Product Builder";
export const siteTitleTemplate = "%s | Hyun Seo";
export const siteDescription =
  "Hyun Seo designs and builds usable products for space systems, RF intelligence, AI, quantum, cyber, and geospatial data.";

export const metadataBase = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://hyun.io"
);

const openGraphImage = {
  url: "/assets/og_default.png",
  width: 1200,
  height: 630,
  alt: "Hyun Seo portfolio preview",
};

export function buildSocialMetadata({
  title,
  description,
  path = "/",
  useTitleTemplate = true,
}: {
  title: string;
  description: string;
  path?: string;
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
      type: "website",
      images: [openGraphImage],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [openGraphImage.url],
    },
  };
}
