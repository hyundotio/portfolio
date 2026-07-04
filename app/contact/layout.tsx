import type { Metadata } from "next";
import { buildSocialMetadata } from "@/utils/metadata";

const description =
  "Contact Hyun Seo about product design, technical strategy, space systems, AI workflows, and complex interfaces.";

export const metadata: Metadata = {
  title: "Contact",
  description,
  ...buildSocialMetadata({
    title: "Contact",
    description,
    path: "/contact",
  }),
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
