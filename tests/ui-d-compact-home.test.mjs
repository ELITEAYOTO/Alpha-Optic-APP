import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const shellCss = readFileSync(new URL("../src/app/layout/DesktopShell.css", import.meta.url), "utf8");
const homeCss = readFileSync(new URL("../src/features/overview/ui/OverviewScreen.css", import.meta.url), "utf8");
const shell = readFileSync(new URL("../src/app/layout/DesktopShell.tsx", import.meta.url), "utf8");
const home = readFileSync(new URL("../src/features/overview/ui/OverviewScreen.tsx", import.meta.url), "utf8");

test("UI D compact layout retains 60/215 rail and explorer and keeps the status bar", () => {
  assert.match(shellCss, /@media \(max-width: 1340px\)/);
  assert.match(shellCss, /grid-template-columns:\s*60px 215px minmax\(0,\s*1fr\)/);
  assert.match(shellCss, /grid-template-rows:\s*54px minmax\(0,\s*1fr\) 30px/);
  assert.match(shellCss, /\.workarea\s*\{\s*padding:\s*22px 30px 16px;/);
  assert.match(shell, /className="statusbar"/);
  assert.match(shell, /aria-current=\{id === active \? "page" : undefined\}/);
});

test("overview navigates to real sections, never claims a live Bridge or fabricated activity", () => {
  for (const destination of ["projects", "connections", "permissions", "sessions", "supervision"]) {
    assert.match(home, new RegExp('destination: "' + destination + '"|onNavigate\\("' + destination + '"\\)'));
  }
  assert.match(home, /Aucun événement réel disponible/);
  assert.match(home, /Aucun droit réel n'est encore disponible/);
  assert.doesNotMatch(home, /dispatch\(.*BRIDGE_|invoke\(|localStorage\./);
  assert.match(homeCss, /@media \(max-width: 1340px\)/);
});

test("approved logo asset is used as a local image and remains decorative next to the product name", () => {
  assert.match(shell, /\/assets\/optic-logo-48\.png/);
  assert.match(shell, /className="optic-logo"/);
  assert.match(shell, /aria-label="Optic"/);
  assert.doesNotMatch(shell, /https:\/\/www\.figma\.com\/api\/mcp\/asset/);
});
