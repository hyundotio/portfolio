import type { Metadata } from "next";
import { buildSocialMetadata } from "@/utils/metadata";

const description =
  "Learn about Hyun Seo's design-led product work across space systems, AI, RF intelligence, cyber, and geospatial data.";

export const metadata: Metadata = {
  title: "About",
  description,
  ...buildSocialMetadata({
    title: "About",
    description,
    path: "/about",
  }),
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
