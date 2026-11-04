import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { BUILTIN_THEMES, DEFAULT_THEME_ID, findBuiltinTheme } from "../src/features/themes/model/builtin-themes.ts";
import { parseThemeManifest, themeToCssVariables } from "../src/features/themes/model/theme-manifest.ts";

const overview = readFileSync(new URL("../src/features/overview/ui/OverviewScreen.tsx", import.meta.url), "utf8");
const settings = readFileSync(new URL("../src/features/settings/ui/SettingsScreen.tsx", import.meta.url), "utf8");
const shell = readFileSync(new URL("../src/app/layout/DesktopShell.tsx", import.meta.url), "utf8");
const shellCss = readFileSync(new URL("../src/app/layout/DesktopShell.css", import.meta.url), "utf8");
const app = readFileSync(new URL("../src/app/App.tsx", import.meta.url), "utf8");

test("eight built-in themes are validated, declarative and keep identical geometry", () => {
  assert.equal(BUILTIN_THEMES.length, 8);
  assert.equal(new Set(BUILTIN_THEMES.map(theme => theme.id)).size, 8);
  assert.equal(BUILTIN_THEMES.filter(theme => theme.appearance === "dark").length, 5);
  assert.equal(BUILTIN_THEMES.filter(theme => theme.appearance === "light").length, 3);
  assert.deepEqual(new Set(BUILTIN_THEMES.map(theme => theme.radius)), new Set([7]));
  for (const theme of BUILTIN_THEMES) {
    assert.ok(parseThemeManifest(theme));
    const colors = themeToCssVariables(theme);
    assert.equal(Object.keys(colors).length, 15);
    assert.ok(colors["--accent"].startsWith("#"));
    assert.equal(Object.isFrozen(theme), true);
  }
  assert.equal(findBuiltinTheme(DEFAULT_THEME_ID)?.name, "Carbone et corail");
  assert.equal(findBuiltinTheme("not-in-catalogue"), undefined);
});

test("appearance exists only in settings with temporary hover and explicit click apply", () => {
  assert.doesNotMatch(overview, /theme-toggle|onToggleAppearance|Thème :/);
  assert.match(settings, /BUILTIN_THEMES\.map/);
  assert.match(settings, /onMouseEnter=\{\(\) => onPreviewTheme\(theme.id\)\}/);
  assert.match(settings, /onMouseLeave=\{\(\) => onPreviewTheme\(null\)\}/);
  assert.match(settings, /onFocus=\{\(\) => onPreviewTheme\(theme.id\)\}/);
  assert.match(settings, /onClick=\{\(\) => onSelectTheme\(theme.id\)\}/);
  assert.match(settings, /aria-pressed=\{selected\}/);
  assert.match(app, /optic\.ui\.theme-id/);
  assert.match(app, /findBuiltinTheme\(id\)/);
  assert.doesNotMatch(settings, /invoke\(|fetch\(|filesystem|\.exec\(/);
});

test("scrollbar is subtle and command search is in the centered titlebar column", () => {
  assert.match(shellCss, /\.titlebar \{ display: grid; grid-template-columns:/);
  assert.match(shellCss, /scrollbar-width: thin/);
  assert.match(shellCss, /width: 6px/);
  assert.match(shellCss, /color-mix\(in srgb, var\(--text\)/);
  assert.ok(shell.indexOf('className="command-trigger"') < shell.indexOf('className="titlebar-tools"'));
  assert.match(shell, /Ctrl K/);
});
