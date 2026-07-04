import type { Metadata } from "next";
import { buildSocialMetadata } from "@/utils/metadata";

const description =
  "View Hyun Seo's resume covering product leadership, design systems, frontend work, space systems, AI, and RF.";

export const metadata: Metadata = {
  title: "Resume",
  description,
  ...buildSocialMetadata({
    title: "Resume",
    description,
    path: "/resume",
  }),
};

export default function ResumeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
