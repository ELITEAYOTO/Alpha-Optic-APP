/**
 * Versioned, declarative appearance tokens — data only, not a plugin system.
 * A theme cannot introduce commands, components, CSS rules, URLs or scripts.
 */
export const THEME_SCHEMA_VERSION = 1;

export const THEME_COLOR_KEYS = [
  "bg", "surface", "subtle", "rail", "explorer", "raised", "border",
  "text", "muted", "faint", "accent", "onAccent", "selected", "warning",
] as const;
export type ThemeColorKey = (typeof THEME_COLOR_KEYS)[number];

export type ThemeColors = Readonly<Record<ThemeColorKey, string>>;
export interface ThemeManifest {
  readonly schemaVersion: 1;
  readonly id: string;
  readonly name: string;
  readonly author: string;
  readonly appearance: "dark" | "light";
  readonly colors: ThemeColors;
  readonly radius: number;
}

const ID = /^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)+$/;
const COLOR = /^#[0-9a-fA-F]{6}$/;
const CONTROL_CHARACTER = /[\u0000-\u001f\u007f]/;
const ROOT_KEYS = ["schemaVersion", "id", "name", "author", "appearance", "colors", "radius"];

function plainRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const prototype: unknown = Object.getPrototypeOf(value);
  return prototype === null || prototype === Object.prototype;
}

function exactKeys(record: Record<string, unknown>, allowed: readonly string[]): boolean {
  const keys = Object.keys(record);
  return keys.length === allowed.length &&
    keys.every((key) => allowed.includes(key)) &&
    allowed.every((key) => Object.hasOwn(record, key));
}

function plainText(value: unknown, maxLength: number): value is string {
  return typeof value === "string" && value.length > 0 &&
    value.length <= maxLength && value.trim() === value &&
    !CONTROL_CHARACTER.test(value);
}

function linearPart(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const r = linearPart(Number.parseInt(hex.slice(1, 3), 16));
  const g = linearPart(Number.parseInt(hex.slice(3, 5), 16));
  const b = linearPart(Number.parseInt(hex.slice(5, 7), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(foreground: string, background: string): number {
  if (!COLOR.test(foreground) || !COLOR.test(background)) {
    throw new TypeError("Only six-digit hex colors are supported");
  }
  const a = luminance(foreground);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/**
 * Reject unknown/unsafe manifest fields, inaccessible primary text and low
 * contrast on primary actions. Preview is a styling operation, never consent.
 */
export function parseThemeManifest(input: unknown): ThemeManifest | null {
  if (!plainRecord(input) || !exactKeys(input, ROOT_KEYS)) return null;
  if (input.schemaVersion !== THEME_SCHEMA_VERSION) return null;
  if (typeof input.id !== "string" || input.id.length > 80 || !ID.test(input.id)) return null;
  if (!plainText(input.name, 64) || !plainText(input.author, 64)) return null;
  if (input.appearance !== "dark" && input.appearance !== "light") return null;
  if (!Number.isInteger(input.radius) || (input.radius as number) < 0 || (input.radius as number) > 16) return null;
  if (!plainRecord(input.colors) || !exactKeys(input.colors, THEME_COLOR_KEYS)) return null;

  const colors: Record<string, string> = Object.create(null);
  for (const key of THEME_COLOR_KEYS) {
    const value = input.colors[key];
    if (typeof value !== "string" || !COLOR.test(value)) return null;
    colors[key] = value.toLowerCase();
  }
  if (
    contrastRatio(colors.text, colors.bg) < 4.5 ||
    contrastRatio(colors.text, colors.surface) < 4.5 ||
    contrastRatio(colors.onAccent, colors.accent) < 4.5
  ) return null;
  return Object.freeze({
    schemaVersion: 1,
    id: input.id,
    name: input.name,
    author: input.author,
    appearance: input.appearance,
    colors: Object.freeze(colors as unknown as ThemeColors),
    radius: input.radius as number,
  });
}

const CSS_TOKEN_MAP: Readonly<Record<ThemeColorKey, string>> = {
  bg: "--bg",
  surface: "--surface",
  subtle: "--subtle",
  rail: "--rail",
  explorer: "--explorer",
  raised: "--raised",
  border: "--border",
  text: "--text",
  muted: "--muted",
  faint: "--faint",
  accent: "--accent",
  onAccent: "--on-accent",
  selected: "--selected",
  warning: "--warning",
};

/** Returns a fixed allowlist of CSS custom properties, never a CSS stylesheet. */
export function themeToCssVariables(theme: ThemeManifest): Readonly<Record<string, string>> {
  // Recheck at the final styling boundary; TypeScript types are not a runtime
  // trust guarantee, and a future plugin/adapter may bypass the first parser.
  const safe = parseThemeManifest(theme);
  if (safe === null) throw new TypeError("Invalid Optic theme manifest");
  const variables: Record<string, string> = Object.create(null);
  for (const key of THEME_COLOR_KEYS) {
    variables[CSS_TOKEN_MAP[key]] = safe.colors[key];
  }
  variables["--radius"] = `${safe.radius}px`;
  return Object.freeze(variables);
}
