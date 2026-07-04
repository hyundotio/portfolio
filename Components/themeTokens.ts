import { Theme } from "@/stores/themeStore";

export function cssToken(name: string) {
  return `var(${name})`;
}

export function getResolvedCssToken(name: string, fallback: string) {
  if (typeof window === "undefined") {
    return fallback;
  }

  return (
    getComputedStyle(document.documentElement).getPropertyValue(name).trim() ||
    fallback
  );
}

export const sceneColorTokens = {
  dark: {
    background: "#050505",
    base: "#000000",
    line: "#f4f4f4",
    gridFallback: "#2c2c2c",
    ibmWire: "#07163c",
    ibmArc: "#7dd3fc",
    kayhanWire: "#18093b",
    kayhanOrbit: "#4b4560",
    kayhanHighlight: "#b78cff",
    hawkeyeWire: "#2b1305",
    hawkeyeAccent: "#ff9a3d",
  },
  light: {
    background: "#ffffff",
    base: "#ffffff",
    line: "#000000",
    gridFallback: "#909090",
    ibmWire: "#8ea2d6",
    ibmArc: "#163a8c",
    kayhanWire: "#a28fda",
    kayhanOrbit: "#6f6886",
    kayhanHighlight: "#a66ae8",
    hawkeyeWire: "#c89a7a",
    hawkeyeAccent: "#a34700",
  },
} as const satisfies Record<Theme, Record<string, string>>;

export const odColorTokens = {
  panel: cssToken("--od-panel"),
  panelStrong: cssToken("--od-panel-strong"),
  panelSoft: cssToken("--od-panel-soft"),
  panelMuted: cssToken("--od-panel-muted"),
  disabled: cssToken("--od-disabled"),
  overlay: cssToken("--od-overlay"),
  text: cssToken("--od-text"),
  textMuted: cssToken("--od-text-muted"),
  textSubtle: cssToken("--od-text-subtle"),
  textHeading: cssToken("--od-text-heading"),
  textContrast: cssToken("--od-text-contrast"),
  textDangerContrast: cssToken("--od-text-danger-contrast"),
  border: cssToken("--od-border"),
  borderMuted: cssToken("--od-border-muted"),
  borderSoft: cssToken("--od-border-soft"),
  borderDanger: cssToken("--od-border-danger"),
  accent: cssToken("--od-accent"),
  accentSoft: cssToken("--od-accent-soft"),
  warn: cssToken("--od-warn"),
  danger: cssToken("--od-danger"),
  dangerSoft: cssToken("--od-danger-soft"),
  success: cssToken("--od-success"),
  reference: cssToken("--od-reference"),
  lightSurface: cssToken("--od-light-surface"),
} as const;

export const odCanvasColorFallbacks = {
  panel: "rgba(7, 13, 20, 0.94)",
  panelStrong: "rgba(7, 13, 20, 0.96)",
  borderMuted: "rgba(72, 103, 126, 0.45)",
  borderSoft: "rgba(72, 103, 126, 0.18)",
  accent: "#00d1ff",
  textMuted: "#90a8b9",
  textSubtle: "#6d8596",
  warn: "#ffd36a",
  danger: "#ff6a3d",
  dangerBorder: "rgba(255, 94, 58, 0.44)",
  reference: "#f4f4f4",
} as const;

export const canvasColorFallbacks = {
  cursorDither: "rgba(255, 255, 255, 0.34)",
} as const;
