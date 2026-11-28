import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Share images in the site's own type: Helvetica (TeX Gyre Heros) throughout,
// sentence case, on white with the resume blue.

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

const fg = "#111111";
const muted = "#6e6e6e";
const rule = "#d6d6d6";
const accent = "#0084ff";
const accentInk = "#006ad1";
const pad = 72;

async function fonts() {
  const read = (...p: string[]) => readFile(join(process.cwd(), ...p));
  const [regular, bold] = await Promise.all([
    read("app/fonts/texgyreheros-regular.otf"),
    read("app/fonts/texgyreheros-bold.otf"),
  ]);
  return [
    { name: "Heros", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "Heros", data: bold, weight: 700 as const, style: "normal" as const },
  ];
}

/** Top bar: the blue rule, then the name as in the header and a muted note. */
function Bar({ left, right }: { left: string; right: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ height: 4, width: "100%", background: accent }} />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          paddingTop: 20,
          fontSize: 26,
        }}
      >
        <div style={{ display: "flex", fontWeight: 700, color: accentInk }}>
          {left}
        </div>
        <div style={{ display: "flex", color: muted }}>{right}</div>
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
              fontSize: 28,
              fontWeight: 700,
              lineHeight: 1.35,
              color: accentInk,
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
        <Bar left="Hyun Seo" right={`Case study, ${years}`} />
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
