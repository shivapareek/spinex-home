/**
 * Storefront colour themes. Each theme sets the CSS variables that the Tailwind colour tokens
 * (ink, surface, line, muted, accent, page, tile…) read from, so switching a theme recolours the
 * whole store without touching components. The admin panel keeps the default palette.
 */

export type ThemeColors = {
  /** Page background */
  page: string;
  /** Soft panels, product tiles */
  surface: string;
  /** Hover / pressed state of surface */
  surface2: string;
  line: string;
  /** Text, dark buttons, footer */
  ink: string;
  ink2: string;
  ink3: string;
  muted: string;
  accent: string;
  accentSoft: string;
  accentDeep: string;
  /** Text on accent buttons */
  onAccent: string;
  /** Three tints for the deity tiles */
  tiles: [string, string, string];
};

export type ThemePreset = { key: string; name: string; description: string; colors: ThemeColors };

export const THEMES: ThemePreset[] = [
  {
    key: "saffron",
    name: "Saffron Classic",
    description: "Crisp white with a saffron accent. Clean and modern.",
    colors: {
      page: "#FFFFFF", surface: "#F6F6F5", surface2: "#F1EEE8", line: "#E8E8E6",
      ink: "#111111", ink2: "#1C1C1C", ink3: "#2A2A2A", muted: "#6B6B6B",
      accent: "#EA580C", accentSoft: "#FFF1E8", accentDeep: "#C2410C", onAccent: "#FFFFFF",
      tiles: ["#F3EDE4", "#E9EEF0", "#EDEBF3"],
    },
  },
  {
    key: "maroon",
    name: "Mandir Maroon",
    description: "Warm ivory, deep maroon and temple gold. Traditional and rich.",
    colors: {
      page: "#FFFBF5", surface: "#F7EEE3", surface2: "#F0E2D2", line: "#EADBC8",
      ink: "#4A0E17", ink2: "#5C1621", ink3: "#701D2B", muted: "#7D6458",
      accent: "#C8941E", accentSoft: "#FBF1DC", accentDeep: "#A2740F", onAccent: "#3B0A10",
      tiles: ["#F6E7D3", "#F3DCD6", "#EFE6CF"],
    },
  },
  {
    key: "peacock",
    name: "Royal Peacock",
    description: "Peacock teal with marigold gold. Calm and premium.",
    colors: {
      page: "#F7FBFA", surface: "#E9F2F1", surface2: "#DCEBE9", line: "#D3E3E1",
      ink: "#0B3B3F", ink2: "#0F4A4F", ink3: "#155A60", muted: "#557174",
      accent: "#E2A325", accentSoft: "#FCF3DC", accentDeep: "#B9831A", onAccent: "#0B3B3F",
      tiles: ["#DDEFEA", "#E3ECF6", "#F4ECD8"],
    },
  },
  {
    key: "lotus",
    name: "Lotus Blush",
    description: "Soft lotus pink with a deep plum. Graceful, great for gifting.",
    colors: {
      page: "#FFF9F8", surface: "#FBEFEE", surface2: "#F6E1E0", line: "#F1DCDA",
      ink: "#3A1424", ink2: "#4A1B2F", ink3: "#5B2339", muted: "#7E6670",
      accent: "#D63E6E", accentSoft: "#FDE8EF", accentDeep: "#B02A57", onAccent: "#FFFFFF",
      tiles: ["#FBE3E6", "#F3E6F4", "#FDEFE2"],
    },
  },
  {
    key: "tulsi",
    name: "Tulsi Green",
    description: "Fresh leaf green with a saffron accent. Natural and peaceful.",
    colors: {
      page: "#F8FBF6", surface: "#EDF3E8", surface2: "#E1EBDA", line: "#DCE6D4",
      ink: "#1E3320", ink2: "#263F28", ink3: "#2F4B31", muted: "#64725F",
      accent: "#D9792B", accentSoft: "#FCEEDF", accentDeep: "#B35F1C", onAccent: "#1E1408",
      tiles: ["#E4EEDC", "#F3EBD9", "#E2ECE9"],
    },
  },
  {
    key: "indigo",
    name: "Royal Indigo",
    description: "Night-sky indigo with warm gold. Bold and luxurious.",
    colors: {
      page: "#F8F8FD", surface: "#EEEEF8", surface2: "#E3E3F3", line: "#DEDEEE",
      ink: "#1D1B4B", ink2: "#26245C", ink3: "#302D6E", muted: "#66658A",
      accent: "#E9A23B", accentSoft: "#FCF1DE", accentDeep: "#C7841F", onAccent: "#1D1B4B",
      tiles: ["#E7E6F7", "#F6EBDD", "#E4EEF6"],
    },
  },
];

export const DEFAULT_THEME_KEY = "saffron";

export type ThemeSettings = {
  preset: string;
  /** Optional custom accent (#RRGGBB); empty = the preset's own accent */
  accent: string;
};

const hexRe = /^#[0-9a-f]{6}$/i;
const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const toHex = (c: number[]) => "#" + c.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0")).join("").toUpperCase();
const mix = (a: string, b: string, t: number) => {
  const [x, y] = [rgb(a), rgb(b)];
  return toHex(x.map((v, i) => v + (y[i] - v) * t));
};
const luminance = (hex: string) => {
  const [r, g, b] = rgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

export const isHex = (v: string) => hexRe.test(v);

/** Final colours for a saved theme: the preset, with a custom accent and its shades derived if set. */
export function resolveTheme(t: Partial<ThemeSettings> | undefined): ThemeColors {
  const preset = THEMES.find((p) => p.key === t?.preset) ?? THEMES[0];
  const c = { ...preset.colors };
  if (t?.accent && isHex(t.accent)) {
    const a = t.accent.toUpperCase();
    c.accent = a;
    c.accentSoft = mix(a, "#FFFFFF", 0.88);
    c.accentDeep = mix(a, "#000000", 0.18);
    // Whichever of white or the theme's ink reads better on the accent
    c.onAccent = contrast(a, "#FFFFFF") >= contrast(a, c.ink) ? "#FFFFFF" : c.ink;
  }
  return c;
}

const ch = (hex: string) => rgb(hex).join(" ");

/** Accent darkened (toward the theme's ink) until it reads as text on the page: at least 3.5:1. */
export function accentText(c: ThemeColors) {
  let t = 0;
  let a = c.accent;
  while (contrast(a, c.page) < 3.5 && t < 1) {
    t += 0.05;
    a = mix(c.accent, c.ink, t);
  }
  return a;
}

/** CSS custom properties (space-separated RGB channels, for Tailwind alpha support). */
export function themeVars(c: ThemeColors): Record<string, string> {
  return {
    "--c-page": ch(c.page),
    "--c-surface": ch(c.surface),
    "--c-surface-2": ch(c.surface2),
    "--c-line": ch(c.line),
    "--c-ink": ch(c.ink),
    "--c-ink-2": ch(c.ink2),
    "--c-ink-3": ch(c.ink3),
    "--c-muted": ch(c.muted),
    "--c-accent": ch(c.accent),
    "--c-accent-soft": ch(c.accentSoft),
    "--c-accent-deep": ch(c.accentDeep),
    "--c-accent-text": ch(accentText(c)),
    "--c-on-accent": ch(c.onAccent),
    "--c-tile-1": ch(c.tiles[0]),
    "--c-tile-2": ch(c.tiles[1]),
    "--c-tile-3": ch(c.tiles[2]),
  };
}

/** A `:root { … }` rule for the theme, so portals and overlays outside the store wrapper match too. */
export function themeCss(c: ThemeColors) {
  return `:root{${Object.entries(themeVars(c)).map(([k, v]) => `${k}:${v}`).join(";")}}`;
}
