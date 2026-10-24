import test from "node:test";
import assert from "node:assert/strict";
import { parseThemeManifest, contrastRatio, themeToCssVariables } from "../src/features/themes/model/theme-manifest.ts";

const sample = () => ({
  schemaVersion: 1,
  id: "community.carbone",
  name: "Carbone et corail",
  author: "Optic",
  appearance: "dark",
  colors: {
    bg: "#17191B",
    surface: "#1E2124",
    subtle: "#24282B",
    rail: "#111316",
    explorer: "#202327",
    raised: "#292D31",
    border: "#373B40",
    text: "#F0EEEC",
    muted: "#AEABA9",
    faint: "#929296",
    accent: "#DB9A85",
    onAccent: "#281C1A",
    selected: "#3C3030",
    warning: "#D9B17D",
  },
  radius: 7,
});

test("accepts declarative high-contrast theme and returns only fixed variables", () => {
  const theme = parseThemeManifest(sample());
  assert.ok(theme);
  assert.equal(theme.id, "community.carbone");
  assert.equal(theme.colors.accent, "#db9a85");
  assert.equal(Object.isFrozen(theme), true);
  assert.equal(Object.isFrozen(theme.colors), true);
  const mapped = themeToCssVariables(theme);
  assert.equal(mapped["--accent"], "#db9a85");
  assert.equal(mapped["--radius"], "7px");
  assert.equal(Object.keys(mapped).length, 15);
});

test("theme manifest rejects executable extensions, CSS injection and unknown properties", () => {
  assert.equal(parseThemeManifest({ ...sample(), script: "alert(1)" }), null);
  assert.equal(parseThemeManifest({ ...sample(), buttons: ["run"] }), null);
  assert.equal(parseThemeManifest({ ...sample(), style: "html{display:none}" }), null);
  assert.equal(parseThemeManifest({ ...sample(), schemaVersion: 2 }), null);
  assert.equal(parseThemeManifest({ ...sample(), colors: { ...sample().colors, unknown: "#ff00ff" } }), null);
  assert.equal(parseThemeManifest({ ...sample(), colors: { ...sample().colors, accent: "url(https://example.com)" } }), null);
  assert.equal(parseThemeManifest({ ...sample(), colors: { ...sample().colors, accent: "#fff; color: red" } }), null);
});

test("theme rejects low contrast, invalid radius and malformed identifiers", () => {
  assert.equal(parseThemeManifest({ ...sample(), colors: { ...sample().colors, text: "#17191B" } }), null);
  assert.equal(parseThemeManifest({ ...sample(), colors: { ...sample().colors, onAccent: "#DB9A85" } }), null);
  assert.equal(parseThemeManifest({ ...sample(), radius: -1 }), null);
  assert.equal(parseThemeManifest({ ...sample(), radius: 100 }), null);
  assert.equal(parseThemeManifest({ ...sample(), id: "../extensions" }), null);
  assert.equal(parseThemeManifest({ ...sample(), author: "someone\nunsafe" }), null);
  assert.equal(parseThemeManifest([]), null);
});

test("contrast ratio follows canonical black/white reference", () => {
  assert.equal(contrastRatio("#000000", "#ffffff"), 21);
  assert.throws(() => contrastRatio("red", "#ffffff"), TypeError);
});
