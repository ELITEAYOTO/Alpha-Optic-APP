import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseDisplayRelease, UPDATER_UNCONFIGURED, updateUiTransition, updaterDisplayMessage } from "../src/features/updates/model/update-state.ts";

const release = { version: "1.4.2", channel: "stable", notes: "Correctifs et stabilité." };
const checking = { phase: "checking" };

test("an unconfigured updater cannot claim an update or request an installation", () => {
  assert.equal(UPDATER_UNCONFIGURED.phase, "unconfigured");
  assert.equal(updateUiTransition(UPDATER_UNCONFIGURED, { type: "begin-check" }), UPDATER_UNCONFIGURED);
  assert.equal(updateUiTransition(UPDATER_UNCONFIGURED, { type: "found", release }), UPDATER_UNCONFIGURED);
  assert.equal(updateUiTransition(UPDATER_UNCONFIGURED, { type: "install-started" }), UPDATER_UNCONFIGURED);
  assert.match(updaterDisplayMessage(UPDATER_UNCONFIGURED), /non configuré/);
});

test("release display metadata rejects unexpected properties, URLs, accessors and malformed versions", () => {
  assert.deepEqual(parseDisplayRelease(release), release);
  assert.equal(Object.isFrozen(parseDisplayRelease(release)), true);
  for (const candidate of [
    { ...release, url: "https://evil.example/installer.exe" },
    { ...release, signature: "forged" },
    { ...release, channel: "nightly" },
    { ...release, version: "01.2.3" },
    { ...release, version: "v1.2.3" },
    { ...release, version: "javascript:alert(1)" },
    { ...release, notes: "x".repeat(4001) },
    { ...release, notes: "broken\u0000data" },
    null, [], {},
  ]) assert.equal(parseDisplayRelease(candidate), null);
  const accessor = { ...release };
  Object.defineProperty(accessor, "version", { enumerable: true, get() { throw Error("getter evaluated"); } });
  assert.equal(parseDisplayRelease(accessor), null);
  const hidden = { ...release };
  Object.defineProperty(hidden, "hidden", { value: "x" });
  assert.equal(parseDisplayRelease(hidden), null);
  const symbol = { ...release, [Symbol("x")]: true };
  assert.equal(parseDisplayRelease(symbol), null);
});

test("display workflow is bounded and cannot install before download", () => {
  assert.deepEqual(updateUiTransition(checking, { type: "install-started" }), checking);
  const available = updateUiTransition(checking, { type: "found", release });
  assert.equal(available.phase, "available");
  assert.match(updaterDisplayMessage(available), /1.4.2/);
  assert.equal(updateUiTransition(available, { type: "install-started" }), available);
  const downloading = updateUiTransition(available, { type: "start-download" });
  assert.equal(downloading.phase, "downloading");
  assert.equal(updateUiTransition(downloading, { type: "download-progress", received: 101, total: 100 }), downloading);
  assert.equal(updateUiTransition(downloading, { type: "download-progress", received: -1, total: 100 }), downloading);
  const progressed = updateUiTransition(downloading, { type: "download-progress", received: 25, total: 100 });
  assert.equal(progressed.received, 25);
  assert.equal(updateUiTransition(progressed, { type: "download-progress", received: 2, total: 100 }), progressed);
  const ready = updateUiTransition(progressed, { type: "download-finished" });
  assert.equal(ready.phase, "ready");
  assert.equal(updateUiTransition(ready, { type: "install-started" }).phase, "installing");
  assert.equal(updateUiTransition(ready, { type: "defer" }).phase, "deferred");
});

test("offline, no update, errors and unverified release are separate statuses", () => {
  assert.equal(updateUiTransition(checking, { type: "up-to-date" }).phase, "current");
  const rejected = updateUiTransition(checking, { type: "found", release: { ...release, url: "https://host/file" } });
  assert.equal(rejected.phase, "failed");
  const fail = updateUiTransition(checking, { type: "failed", stage: "check", message: "https://secret" });
  assert.equal(fail.phase, "failed");
  assert.doesNotMatch(JSON.stringify(fail), /secret/);
  assert.equal(updateUiTransition(fail, { type: "reset" }), UPDATER_UNCONFIGURED);
});

test("settings UX contains no updater network or privileged calls and the check is unavailable", () => {
  const app = readFileSync(new URL("../src/app/App.tsx", import.meta.url), "utf8");
  const panel = readFileSync(new URL("../src/features/updates/ui/UpdatesPanel.tsx", import.meta.url), "utf8");
  assert.match(app, /section === "settings"/);
  assert.match(panel, /disabled title=/);
  assert.match(panel, /NON ACTIVÉ/);
  assert.doesNotMatch(panel, /fetch\(|invoke\(|downloadAndInstall\(|openUrl\(/);
});
