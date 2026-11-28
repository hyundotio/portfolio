import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Share images in the site's own type: Helvetica (TeX Gyre Heros) for words,
// IBM Plex Mono caps for labels, on white with the resume blue.

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

const fg = "#111111";
const muted = "#6e6e6e";
const rule = "#d6d6d6";
const accent = "#0084ff";
const pad = 72;

async function fonts() {
  const read = (...p: string[]) => readFile(join(process.cwd(), ...p));
  const [regular, bold, mono] = await Promise.all([
    read("app/fonts/texgyreheros-regular.otf"),
    read("app/fonts/texgyreheros-bold.otf"),
    read(
      "node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff",
    ),
  ]);
  return [
    { name: "Heros", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "Heros", data: bold, weight: 700 as const, style: "normal" as const },
    { name: "Plex Mono", data: mono, weight: 400 as const, style: "normal" as const },
  ];
}

function Label({ children, color = fg }: { children: string; color?: string }) {
  return (
    <div
      style={{
        display: "flex",
        fontFamily: "Plex Mono",
        fontSize: 22,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color,
      }}
    >
      {children}
    </div>
  );
}

/** Top bar: the blue rule over a row of mono caps labels, like a section head. */
function Bar({ left, right }: { left: string; right: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ height: 4, width: "100%", background: accent }} />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          paddingTop: 20,
        }}
      >
        <Label>{left}</Label>
        <Label color={muted}>{right}</Label>
      </div>
    </div>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: pad,
        background: "#ffffff",
        color: fg,
        fontFamily: "Heros",
      }}
    >
      {children}
    </div>
  );
}

/** Home, and the pages without their own image. */
export async function siteOgImage({
  headline,
  footer,
}: {
  headline: string;
  footer: string;
}) {
  // One flex item per word, so the blue period stays on the last word's line.
  const words = headline.replace(/\.$/, "").split(" ");
  const last = words.pop();
  return new ImageResponse(
    (
      <Frame>
        <Bar left="Hyun Seo" right="hyun.io" />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontSize: 76,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              maxWidth: 1000,
              paddingBottom: 36,
            }}
          >
            {words.map((word, i) => (
              <span key={i} style={{ marginRight: "0.24em" }}>
                {word}
              </span>
            ))}
            <div style={{ display: "flex" }}>
              <span>{last}</span>
              <span style={{ color: accent }}>.</span>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              borderTop: `1px solid ${rule}`,
              paddingTop: 20,
              fontSize: 26,
              lineHeight: 1.35,
              color: muted,
            }}
          >
            {footer}
          </div>
        </div>
      </Frame>
    ),
    { ...ogSize, fonts: await fonts() },
  );
}

/** A case study: the company as a wordmark in its own color, then the claim. */
export async function workOgImage({
  company,
  color,
  heading,
  years,
}: {
  company: string;
  color: string;
  heading: string;
  years: string;
}) {
  // Fit the wordmark to the width: Heros bold, set tight, runs ~0.58em a letter.
  const wordmarkSize = Math.min(
    220,
    Math.floor((ogSize.width - pad * 2) / (company.length * 0.58)),
  );

  return new ImageResponse(
    (
      <Frame>
        <Bar left="Hyun Seo / Case study" right={years} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: wordmarkSize,
              fontWeight: 700,
              lineHeight: 0.9,
              letterSpacing: "-0.04em",
              color,
              marginLeft: -6,
              paddingBottom: 32,
            }}
          >
            {company}
          </div>
          <div
            style={{
              display: "flex",
              borderTop: `1px solid ${rule}`,
              paddingTop: 22,
              fontSize: 38,
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
            }}
          >
            {heading}
          </div>
        </div>
      </Frame>
    ),
    { ...ogSize, fonts: await fonts() },
  );
}
