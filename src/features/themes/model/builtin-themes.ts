import { parseThemeManifest, type ThemeColors, type ThemeManifest } from "./theme-manifest.ts";

/** Built-in appearances are data-only. No layout, script, permission or Bridge state belongs to a theme. */
const dark: ThemeColors = {
  bg: "#17191b", surface: "#1e2124", subtle: "#24282b", rail: "#111316",
  explorer: "#202327", raised: "#292d31", border: "#373b40", text: "#f0eeec",
  muted: "#aeaba9", faint: "#929296", accent: "#db9a85", onAccent: "#281c1a",
  selected: "#3c3030", warning: "#d9b17d",
};
const light: ThemeColors = {
  bg: "#f5f2ee", surface: "#fffefd", subtle: "#efeae6", rail: "#25232a",
  explorer: "#ede9e6", raised: "#f6f3f0", border: "#ded8d5", text: "#29272b",
  muted: "#716b70", faint: "#978e94", accent: "#96566c", onAccent: "#ffffff",
  selected: "#e9dde2", warning: "#b17a45",
};

function defineTheme(id: string, name: string, appearance: "dark" | "light",
  colors: Partial<ThemeColors>): ThemeManifest {
  const value = parseThemeManifest({
    schemaVersion: 1, id, name, author: "Optic", appearance, radius: 7,
    colors: { ...(appearance === "dark" ? dark : light), ...colors },
  });
  if (!value) throw new Error("Invalid built-in Optic theme: " + id);
  return value;
}

export const BUILTIN_THEMES: readonly ThemeManifest[] = Object.freeze([
  defineTheme("optic.carbone-corail", "Carbone et corail", "dark", {}),
  defineTheme("optic.lin-grenat", "Lin et grenat", "light", {}),
  defineTheme("optic.graphite-azur", "Graphite et azur", "dark", {
    bg: "#151a21", surface: "#1b222c", subtle: "#212c37", rail: "#10141b",
    explorer: "#1a2430", raised: "#283543", border: "#344657", text: "#f1f5fb",
    muted: "#bac6d1", faint: "#98a8ba", accent: "#86b6f2", onAccent: "#152434",
    selected: "#263b50", warning: "#d5ab71",
  }),
  defineTheme("optic.ardoise-ambre", "Ardoise et ambre", "dark", {
    bg: "#1b1d20", surface: "#23262b", subtle: "#292d32", rail: "#141619",
    explorer: "#24272c", raised: "#30353b", border: "#41464c", text: "#f2f0eb",
    muted: "#c1bbb1", faint: "#a7a094", accent: "#e3ad66", onAccent: "#2b2119",
    selected: "#40352a", warning: "#e0b579",
  }),
  defineTheme("optic.nuit-sauge", "Nuit et sauge", "dark", {
    bg: "#171d1b", surface: "#1d2521", subtle: "#263029", rail: "#101714",
    explorer: "#202b25", raised: "#2d3b32", border: "#3c4d42", text: "#f0f4ef",
    muted: "#b6c7b9", faint: "#98ac9c", accent: "#a9c4af", onAccent: "#1e2b22",
    selected: "#304538", warning: "#d1bd83",
  }),
  defineTheme("optic.ocean-cuivre", "Océan et cuivre", "dark", {
    bg: "#142027", surface: "#1c2b32", subtle: "#243640", rail: "#0e171e",
    explorer: "#1c2c35", raised: "#2c3d46", border: "#3e5059", text: "#edf3f4",
    muted: "#b9c8cc", faint: "#98adb2", accent: "#d5a082", onAccent: "#2b1e1a",
    selected: "#3f3738", warning: "#d2b17c",
  }),
  defineTheme("optic.ivoire-prune", "Ivoire et prune", "light", {
    bg: "#f9f6f2", surface: "#ffffff", subtle: "#f1ecea", rail: "#302934",
    explorer: "#efe9eb", raised: "#f6f0f3", border: "#ded5da", text: "#312b33",
    muted: "#70656e", faint: "#8b8087", accent: "#804669", onAccent: "#ffffff",
    selected: "#e9dce5", warning: "#a57943",
  }),
  defineTheme("optic.sable-bleu", "Sable et bleu", "light", {
    bg: "#f5f2e9", surface: "#fffdf8", subtle: "#efe9dc", rail: "#202f3c",
    explorer: "#eee8dd", raised: "#f7f3e9", border: "#dad4c8", text: "#283440",
    muted: "#657079", faint: "#7d8991", accent: "#2a6287", onAccent: "#ffffff",
    selected: "#dbe9f0", warning: "#a97a36",
  }),
]);

export const DEFAULT_THEME_ID = "optic.carbone-corail";
export function findBuiltinTheme(id: string | null | undefined): ThemeManifest | undefined {
  return BUILTIN_THEMES.find(theme => theme.id === id);
}
