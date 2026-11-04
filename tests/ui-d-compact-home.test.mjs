import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const shellCss = readFileSync(new URL("../src/app/layout/DesktopShell.css", import.meta.url), "utf8");
const homeCss = readFileSync(new URL("../src/features/overview/ui/OverviewScreen.css", import.meta.url), "utf8");
const shell = readFileSync(new URL("../src/app/layout/DesktopShell.tsx", import.meta.url), "utf8");
const home = readFileSync(new URL("../src/features/overview/ui/OverviewScreen.tsx", import.meta.url), "utf8");
const demo = readFileSync(new URL("../src/features/overview/model/demo.ts", import.meta.url), "utf8");
const app = readFileSync(new URL("../src/app/App.tsx", import.meta.url), "utf8");
const theme = readFileSync(new URL("../src/styles/tokens.css", import.meta.url), "utf8");

test("UI D compact layout retains 60/215 rail and explorer and keeps the status bar", () => {
  assert.match(shellCss, /@media \(max-width: 1340px\)/);
  assert.match(shellCss, /grid-template-columns:\s*60px 215px minmax\(0,\s*1fr\)/);
  assert.match(shellCss, /grid-template-rows:\s*54px minmax\(0,\s*1fr\) 30px/);
  assert.match(shellCss, /\.workarea\s*\{\s*padding:\s*22px 30px 16px;/);
  assert.match(shell, /className="statusbar"/);
  assert.match(shell, /aria-current=\{id === active \? "page" : undefined\}/);
});

test("overview preserves preparation and context but replaces checks/activity with exactly three demo project rows", () => {
  assert.match(home, /Créer une session sécurisée/);
  assert.match(home, /Préparer une session →/);
  assert.match(home, /Votre contexte/);
  assert.match(home, /Projets récents/);
  assert.match(home, /exampleRecentProjects\.map/);
  assert.match(home, /Exemples fictifs/);
  assert.match(home, /className="recent-project-resume" disabled/);
  assert.doesNotMatch(home, /À vérifier avant le lancement|Activité récente|Ouvrir le journal/);
  assert.equal((demo.match(/id: "demo-/g) || []).length, 3);
  assert.doesNotMatch(home, /dispatch\(.*BRIDGE_|invoke\(|localStorage\./);
  assert.match(homeCss, /@media \(max-width: 1340px\)/);
});

test("light and dark palettes share the same DOM and geometric rules", () => {
  assert.match(app, /data-theme=\{appearance\}/);
  assert.match(app, /themeToCssVariables\(renderedTheme\)/);
  assert.match(app, /onSelectTheme=\{selectTheme\}/);
  assert.doesNotMatch(home, /onToggleAppearance|theme-toggle|Thème :/);
  assert.match(theme, /--accent: #db9a85/);
  assert.match(theme, /--accent: #db9a85/);
  assert.doesNotMatch(homeCss, /data-theme/);
  assert.doesNotMatch(shellCss, /data-theme/);
});

test("approved logo asset is used as a local image and remains decorative next to the product name", () => {
  assert.match(shell, /\/assets\/optic-logo-48\.png/);
  assert.match(shell, /className="optic-logo"/);
  assert.match(shell, /aria-label="Optic"/);
  assert.doesNotMatch(shell, /https:\/\/www\.figma\.com\/api\/mcp\/asset/);
});
