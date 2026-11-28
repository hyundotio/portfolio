import "./globals.css";
import type { Metadata, Viewport } from "next";
import Link from "next/link";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import CopyForLLM from "@/app/_components/CopyForLLM";
import MobileMenu from "@/app/_components/MobileMenu";
import SmoothHashLinks from "@/app/_components/SmoothHashLinks";
import ThemeSwitch from "@/app/_components/ThemeSwitch";
import { themeScript } from "@/app/_components/themeScript";
import { examplePrompt } from "@/content/llm";
import { legalText, links } from "@/content/site";
import {
  buildSocialMetadata,
  metadataBase,
  siteDescription,
  siteTitle,
  siteTitleTemplate,
} from "@/utils/metadata";

// TeX Gyre Heros: a free Helvetica clone (GUST Font License, see app/fonts).
// Only used where Helvetica isn't installed, so it isn't preloaded: Apple
// devices never download it.
const heros = localFont({
  src: [
    { path: "./fonts/texgyreheros-regular.otf", weight: "400", style: "normal" },
    { path: "./fonts/texgyreheros-bold.otf", weight: "700", style: "normal" },
  ],
  variable: "--font-sans",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: siteTitle,
    template: siteTitleTemplate,
  },
  description: siteDescription,
  applicationName: "Hyun Seo",
  authors: [{ name: "Hyun Seo", url: "/" }],
  creator: "Hyun Seo",
  ...buildSocialMetadata({
    title: siteTitle,
    description: siteDescription,
    useTitleTemplate: false,
  }),
  manifest: "/site.webmanifest",
  appleWebApp: {
    title: "Hyun Seo",
  },
  icons: {
    icon: [
      { url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

// Browser chrome follows the page: white, or near-black in dark mode.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#121212" },
  ],
};

const nav = [
  { title: "Work", href: "/#work" },
  { title: "About", href: "/#about" },
  { title: "Resume", href: "/resume" },
  { title: "Contact", href: "/contact" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // The head script may set data-theme before React hydrates.
    <html lang="en" className={heros.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <header className="site-header">
          <div className="grid">
            <Link href="/" className="brand col-label">
              Hyun Seo
            </Link>
            <nav className="site-nav" aria-label="Main">
              <ul>
                {nav.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href}>{item.title}</Link>
                  </li>
                ))}
                <li>
                  <a href={links.linkedin} target="_blank" rel="noreferrer">
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a href={links.github} target="_blank" rel="noreferrer">
                    GitHub
                  </a>
                </li>
                <li>
                  <CopyForLLM variant="nav" prompt={examplePrompt} />
                </li>
              </ul>
            </nav>
            <ThemeSwitch className="theme-slot" />
            <MobileMenu
              llmPrompt={examplePrompt}
              items={[
                ...nav,
                { title: "LinkedIn", href: links.linkedin, external: true },
                { title: "GitHub", href: links.github, external: true },
              ]}
            />
          </div>
        </header>

        <main>{children}</main>

        <footer className="site-footer grid small muted">
          <p className="col-label">
            © {new Date().getUTCFullYear()} Hyun Seo. All rights reserved.
          </p>
          <p className="col-text">{legalText}</p>
        </footer>
        <SmoothHashLinks />
        <Analytics />
      </body>
    </html>
  );
}
