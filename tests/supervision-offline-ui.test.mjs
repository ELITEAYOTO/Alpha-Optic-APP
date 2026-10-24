import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const screen = readFileSync(new URL("../src/features/supervision/ui/SupervisionScreen.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/features/supervision/ui/SupervisionScreen.css", import.meta.url), "utf8");
const app = readFileSync(new URL("../src/app/App.tsx", import.meta.url), "utf8");
const entry = readFileSync(new URL("../src/main.tsx", import.meta.url), "utf8");
const journal = readFileSync(new URL("../src/features/supervision/model/journal.ts", import.meta.url), "utf8");

test("supervision offline view does not pretend that an event CLI or Bridge session exists", () => {
  assert.match(screen, /SOURCE NON CONNECTÉE/);
  assert.match(screen, /Flux d'événements indisponible/);
  assert.match(screen, /Aucun événement authentifié ne peut être affiché/);
  assert.match(screen, /Aucun journal réel n'est chargé/);
  assert.doesNotMatch(screen, /\$ optic events|--follow|<input|<textarea|fetch\(|invoke\(|spawn\(|localStorage|setInterval/);
  assert.doesNotMatch(screen, /(?:0 événement|0 évènement|Connecté|Autorisations effectives)/);
});

test("only app composition owns the navigation; offline user action returns home", () => {
  assert.match(screen, /onReturnHome: \(\) => void/);
  assert.match(screen, /onClick=\{onReturnHome\}/);
  assert.match(screen, /type="button"/);
  assert.match(app, /<SupervisionScreen onReturnHome=\{\(\) => setSection\("home"\)\} \/>/);
  assert.doesNotMatch(screen, /from ["'][^"']*\/app\//);
  assert.match(screen, /aria-labelledby="supervision-title"/);
  assert.match(screen, /role="status"/);
});

test("feature owns compact responsive and accessible style without touching the terminal", () => {
  assert.match(entry, /import "\.\/features\/supervision\/ui\/SupervisionScreen\.css"/);
  assert.match(css, /\.supervision-screen \.tool-panel/);
  assert.match(css, /\.supervision-facts/);
  assert.match(css, /\.supervision-back:focus-visible/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.doesNotMatch(css, /\.console-empty|\.terminal-screen/);
  assert.match(journal, /sourceInstanceId/);
  assert.match(journal, /missingEvents/);
});
