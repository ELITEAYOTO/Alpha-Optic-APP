import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const approved = readFileSync(new URL("../public/assets/optic-logo-48.png", import.meta.url));
const nativePng = readFileSync(new URL("../src-tauri/icons/icon.png", import.meta.url));
const ico = readFileSync(new URL("../src-tauri/icons/icon.ico", import.meta.url));
const config = JSON.parse(readFileSync(new URL("../src-tauri/tauri.conf.json", import.meta.url), "utf8"));
const capability = JSON.parse(readFileSync(new URL("../src-tauri/capabilities/main-minimal.json", import.meta.url), "utf8"));

test("native taskbar logo uses the exact approved Optic header asset", () => {
  assert.deepEqual(nativePng, approved);
  assert.equal(approved.readUInt32BE(16), 48);
  assert.equal(approved.readUInt32BE(20), 48);
  assert.equal(ico.readUInt16LE(0), 0);
  assert.equal(ico.readUInt16LE(2), 1);
  assert.equal(ico.readUInt16LE(4), 1);
  assert.equal(ico.readUInt8(6), 48);
  assert.equal(ico.readUInt8(7), 48);
  assert.equal(ico.readUInt16LE(12), 32);
  const size = ico.readUInt32LE(14);
  const offset = ico.readUInt32LE(18);
  assert.equal(offset, 22);
  assert.equal(size, approved.length);
  assert.deepEqual(ico.subarray(offset, offset + size), approved);
  assert.equal(ico.length, 22 + size);
});

test("Optic uses a custom Windows titlebar with the smallest window-only capabilities", () => {
  const main = config.app.windows.find(w => w.label === "main");
  assert.ok(main);
  assert.equal(main.decorations, false);
  assert.equal(main.theme, "Dark");
  assert.deepEqual(config.bundle.icon, ["icons/icon.png", "icons/icon.ico"]);
  assert.equal(config.bundle.active, false);
  assert.deepEqual(capability.permissions, [
    "core:window:allow-minimize",
    "core:window:allow-toggle-maximize",
    "core:window:allow-close",
    "core:window:allow-start-dragging",
  ]);
  assert.equal(config.app.withGlobalTauri, undefined);
});
