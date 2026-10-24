import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { auditNativeIconCandidate, readIcoEntries, readPngHeader, REQUIRED_ICO_SIZES, OPTIC_SOURCE_SHA256 } from "../scripts/check-native-icon-candidate.mjs";

const logo48 = readFileSync(new URL("../public/assets/optic-logo-48.png", import.meta.url));
const currentIco = readFileSync(new URL("../src-tauri/icons/icon.ico", import.meta.url));
const currentPng = readFileSync(new URL("../src-tauri/icons/icon.png", import.meta.url));

function icoFixture(sizes) {
  const payload = Buffer.alloc(32);
  const bytes = Buffer.alloc(6 + sizes.length * 16 + sizes.length * payload.length);
  bytes.writeUInt16LE(1, 2);
  bytes.writeUInt16LE(sizes.length, 4);
  sizes.forEach((size, i) => {
    const at = 6 + i * 16;
    bytes.writeUInt8(size === 256 ? 0 : size, at);
    bytes.writeUInt8(size === 256 ? 0 : size, at + 1);
    bytes.writeUInt16LE(1, at + 4);
    bytes.writeUInt16LE(32, at + 6);
    bytes.writeUInt32LE(payload.length, at + 8);
    bytes.writeUInt32LE(6 + sizes.length * 16 + i * payload.length, at + 12);
  });
  return bytes;
}

test("current 48px bootstrap replacement cannot masquerade as a 512px multi-size release icon", () => {
  const audit = auditNativeIconCandidate({ source: logo48, iconPng: currentPng, iconIco: currentIco });
  assert.equal(audit.valid, false);
  assert.ok(audit.errors.some(x => /512/.test(x)));
  assert.ok(audit.errors.some(x => /16 px/.test(x)));
  assert.deepEqual(readIcoEntries(currentIco).map(e => e.width), [48]);
});

test("PNG source demands verified RGBA format, size and approved hash", () => {
  assert.deepEqual(readPngHeader(logo48), { width: 48, height: 48, depth: 8, colorType: 6 });
  const source = Buffer.from(logo48);
  source.writeUInt32BE(512, 16);
  source.writeUInt32BE(512, 20);
  const testIco = icoFixture(REQUIRED_ICO_SIZES);
  const audit = auditNativeIconCandidate({ source, iconPng: source, iconIco: testIco });
  assert.equal(audit.valid, false);
  assert.ok(audit.errors.some(x => /SHA-256/.test(x)));
  assert.match(OPTIC_SOURCE_SHA256, /^[0-9a-f]{64}$/);
  assert.equal(readPngHeader(Buffer.from("not a png")), null);
  const wrongColor = Buffer.from(source);
  wrongColor[25] = 2;
  assert.equal(auditNativeIconCandidate({source: wrongColor, iconPng: source, iconIco: testIco}).valid, false);
});

test("ICO parser checks bounds, duplicate layers and missing required sizes", () => {
  const full = icoFixture(REQUIRED_ICO_SIZES);
  assert.deepEqual(readIcoEntries(full).map(e=>e.width), REQUIRED_ICO_SIZES);
  assert.equal(readIcoEntries(full.subarray(0, 32)), null);
  const badOffset = Buffer.from(full);
  badOffset.writeUInt32LE(0xffffffff, 6 + 12);
  assert.equal(readIcoEntries(badOffset), null);
  const duplicate = icoFixture([16,16,24,32,48,64,256]);
  const result = auditNativeIconCandidate({source: logo48, iconPng: logo48, iconIco: duplicate});
  assert.ok(result.errors.some(x=>/dupliqu/.test(x)));
  const short = icoFixture([16, 32, 48]);
  assert.equal(auditNativeIconCandidate({source: logo48, iconPng: logo48, iconIco: short}).valid, false);
});

test("icon verification is offline and cannot mutate the repository", () => {
  const s = readFileSync(new URL("../scripts/check-native-icon-candidate.mjs", import.meta.url), "utf8");
  assert.doesNotMatch(s, /writeFile|unlink|renameSync|fetch\(|spawn\(|exec\(|chmod|curl|process\.env\.GITHUB_TOKEN/);
});
