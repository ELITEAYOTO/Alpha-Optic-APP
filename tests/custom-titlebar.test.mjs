import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const shell = readFileSync(new URL("../src/app/layout/DesktopShell.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/app/layout/DesktopShell.css", import.meta.url), "utf8");
const conf = JSON.parse(readFileSync(new URL("../src-tauri/tauri.conf.json", import.meta.url), "utf8"));
const permissions = JSON.parse(readFileSync(new URL("../src-tauri/capabilities/main-minimal.json", import.meta.url), "utf8"));

test("single Figma-style window bar retains native actions and a distinct drag surface", () => {
  assert.equal(conf.app.windows.find(w => w.label === "main").decorations, false);
  assert.match(shell, /data-tauri-drag-region/);
  for (const method of ["minimize", "toggleMaximize", "close"]) assert.match(shell, new RegExp("current\\." + method + "\\("));
  assert.match(shell, /disabled=\{!nativeWindowAvailable\}/);
  assert.match(shell, /aria-label="Réduire la fenêtre"/);
  assert.match(shell, /aria-label="Fermer la fenêtre"/);
  assert.match(css, /\.window-controls button/);
});

test("window-specific capabilities do not confer Bridge, filesystem, or shell authority", () => {
  assert.deepEqual(permissions.permissions, [
    "core:window:allow-minimize",
    "core:window:allow-toggle-maximize",
    "core:window:allow-close",
    "core:window:allow-start-dragging",
  ]);
  assert.equal(conf.app.withGlobalTauri, undefined);
  assert.doesNotMatch(shell, /invoke\(|localStorage\.|sessionStorage\./);
});

test("command palette is keyboard accessible and only navigates registered pages", () => {
  assert.match(shell, /event\.ctrlKey \|\| event\.metaKey/);
  assert.match(shell, /event\.key\.toLowerCase\(\) === "k"/);
  assert.match(shell, /event\.key === "Escape"/);
  assert.match(shell, /role="dialog"/);
  assert.match(shell, /commandInput\.current\?\.focus/);
  assert.match(shell, /destinations\.filter/);
  assert.match(shell, /onNavigate\(destination\)/);
  assert.match(shell, /Navigation uniquement\. Aucune commande native/);
  assert.match(css, /@media \(max-width: 1120px\)/);
  assert.match(css, /prefers-reduced-motion: reduce/);
});

test("UI D titlebar shows only Optic identity, centered command search and native controls", () => {
  assert.match(shell, /<strong>optic<\/strong>/);
  assert.doesNotMatch(shell, /identity-caption|className="breadcrumb"|<strong>optic<\/strong><span/);
  assert.match(css, /\.titlebar \{ display: grid; grid-template-columns: minmax\(0, 1fr\) minmax\(250px, 350px\) minmax\(0, 1fr\)/);
  assert.match(css, /@media \(max-width: 1150px\) \{[\s\S]*?minmax\(160px, 235px\) minmax\(0, 1fr\)/);
  assert.doesNotMatch(css, /\.identity-caption|\.breadcrumb/);
  assert.match(shell, /<div className="titlebar-main" data-tauri-drag-region>/);
  assert.match(shell, /className="command-trigger"/);
  assert.match(shell, /className="window-controls"/);
  assert.match(shell, /aria-label="Agrandir ou restaurer la fenêtre"/);
});
