import "@/styles/reset.css";
import "@/styles/theme.scss";
import "@/styles/typography.scss";
import "@/styles/globals.css";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import AppShell from "@/Components/AppShell";
import ThemeProvider from "@/Components/ThemeProvider";
import RouteTransitionProvider from "@/Components/RouteTransitionProvider";
import {
  buildSocialMetadata,
  metadataBase,
  siteDescription,
  siteTitle,
  siteTitleTemplate,
} from "@/utils/metadata";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: siteTitle,
    template: siteTitleTemplate,
  },
  description: siteDescription,
  ...buildSocialMetadata({
    title: siteTitle,
    description: siteDescription,
    useTitleTemplate: false,
  }),
  manifest: "/site.webmanifest",
  appleWebApp: {
    title: "Hyun.io",
  },
  icons: {
    icon: [
      {
        url: "/favicon-96x96.png",
        type: "image/png",
        sizes: "96x96",
      },
      {
        url: "/favicon.svg",
        type: "image/svg+xml",
      },
    ],
    shortcut: "/favicon.ico",
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
      },
    ],
  },
};

const navLinks = [
  { title: "Hyun.io", href: "/" },
  { title: "Work", href: "/work/ibm" },
  {
    title: "Resume",
    href: "/resume",
  },
  { title: "Contact", href: "/contact" },
  { title: "About", href: "/about" },
  {
    title: "LinkedIn ⧉",
    href: "https://linkedin.com/in/hyunseo",
    target: "_blank",
  },
];

export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.className} ${inter.variable}`}>
      <body>
        <ThemeProvider>
          <RouteTransitionProvider>
            <AppShell navLinks={navLinks} modal={modal}>
              {children}
            </AppShell>
          </RouteTransitionProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
