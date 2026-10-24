import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const shell = readFileSync(new URL("../src/app/layout/DesktopShell.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/app/layout/DesktopShell.css", import.meta.url), "utf8");
const base = readFileSync(new URL("../src/styles/base.css", import.meta.url), "utf8");

test("explorer can be hidden and shown without hiding primary navigation", () => {
  assert.match(shell, /useState\(false\)/);
  assert.match(shell, /onClick=\{\(\) => setExplorerHidden\(hidden => !hidden\)\}/);
  assert.match(shell, /aria-expanded=\{!explorerHidden\}/);
  assert.match(shell, /aria-controls="optic-explorer"/);
  assert.match(shell, /id="optic-explorer"/);
  assert.match(shell, /hidden=\{explorerHidden\}/);
  assert.match(shell, /destinations\.map/);
  assert.match(shell, /explorer-collapsed/);
  assert.match(css, /\.explorer\[hidden\] \{ display: none; \}/);
});

test("collapsed layout restores content width on both UI D reference widths", () => {
  assert.match(css, /\.workspace\.explorer-collapsed \{ grid-template-columns: 70px minmax\(0, 1fr\); \}/);
  assert.match(css, /@media \(max-width: 1340px\)/);
  assert.match(css, /\.workspace\.explorer-collapsed \{ grid-template-columns: 60px minmax\(0, 1fr\); \}/);
  assert.match(css, /\.workarea \{ overflow-y: auto;/);
});

test("controls provide hover, keyboard focus, and reduced-motion behavior", () => {
  assert.match(css, /\.icon-rail button:hover/);
  assert.match(css, /\.explorer-links button\.selected:hover/);
  assert.match(base, /button:focus-visible/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(base, /prefers-reduced-motion: reduce/);
  assert.doesNotMatch(shell, /localStorage|sessionStorage|invoke\(/);
});
