#!/usr/bin/env node
/**
 * Local asset validation only. This script neither writes files nor launches
 * a compiler, installer, network request, or Tauri process.
 *
 * Usage:
 *   node scripts/check-native-icon-candidate.mjs SOURCE_PNG ICON_DIRECTORY
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const OPTIC_SOURCE_SHA256 = "d353f8a07d908dd43d6db9e169c913e8e6de5ef0509eab9369c373b690b01c2d";
export const REQUIRED_ICO_SIZES = Object.freeze([16, 24, 32, 48, 64, 256]);
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

export function readPngHeader(bytes) {
  if (!Buffer.isBuffer(bytes) || bytes.length < 33 ||
      !bytes.subarray(0, 8).equals(PNG_SIGNATURE) ||
      bytes.toString("ascii", 12, 16) !== "IHDR" ||
      bytes.readUInt32BE(8) !== 13) return null;
  return Object.freeze({
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
    depth: bytes.readUInt8(24),
    colorType: bytes.readUInt8(25),
  });
}

export function readIcoEntries(bytes) {
  if (!Buffer.isBuffer(bytes) || bytes.length < 22 || bytes.length > 8 * 1024 * 1024 ||
      bytes.readUInt16LE(0) !== 0 || bytes.readUInt16LE(2) !== 1) return null;
  const count = bytes.readUInt16LE(4);
  if (count < 1 || count > 32 || bytes.length < 6 + count * 16) return null;
  const result = [];
  for (let i = 0; i < count; i++) {
    const at = 6 + i * 16;
    const width = bytes.readUInt8(at) || 256;
    const height = bytes.readUInt8(at + 1) || 256;
    const planes = bytes.readUInt16LE(at + 4);
    const bitDepth = bytes.readUInt16LE(at + 6);
    const size = bytes.readUInt32LE(at + 8);
    const offset = bytes.readUInt32LE(at + 12);
    if (width !== height || planes > 1 || (bitDepth !== 0 && bitDepth !== 32) ||
        size < 16 || offset < 6 + count * 16 ||
        offset > bytes.length || size > bytes.length - offset) return null;
    result.push(Object.freeze({ width, size, offset }));
  }
  return Object.freeze(result);
}

export function auditNativeIconCandidate({ source, iconPng, iconIco }) {
  const errors = [];
  const info = readPngHeader(source);
  if (!info || info.width !== 512 || info.height !== 512 ||
      info.depth !== 8 || info.colorType !== 6) {
    errors.push("Logo source invalide : PNG 512 x 512 RGBA 8 bits obligatoire.");
  } else if (createHash("sha256").update(source).digest("hex") !== OPTIC_SOURCE_SHA256) {
    errors.push("Le logo ne correspond pas aux octets officiels approuvés (SHA-256 incorrect).");
  }

  const png = readPngHeader(iconPng);
  if (!png || png.width !== 512 || png.height !== 512 ||
      png.depth !== 8 || png.colorType !== 6) {
    errors.push("icon.png doit être un PNG transparent 512 x 512 RGBA 8 bits.");
  }

  const entries = readIcoEntries(iconIco);
  if (!entries) {
    errors.push("icon.ico : entêtes, offsets, dimensions ou tailles invalides.");
  } else {
    const counts = new Map();
    for (const e of entries) counts.set(e.width, (counts.get(e.width) ?? 0) + 1);
    for (const size of REQUIRED_ICO_SIZES) {
      if (counts.get(size) !== 1) errors.push("icon.ico : exactement un calque " + size + " px requis.");
    }
    if (counts.size !== entries.length) errors.push("icon.ico : calques de taille dupliquée.");
  }
  return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
}

export function inspectIconCandidatePaths(sourcePath, iconDirectory) {
  return auditNativeIconCandidate({
    source: readFileSync(resolve(sourcePath)),
    iconPng: readFileSync(join(resolve(iconDirectory), "icon.png")),
    iconIco: readFileSync(join(resolve(iconDirectory), "icon.ico")),
  });
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const args = process.argv.slice(2);
  if (args.length !== 2 || args.some(a => !a.trim())) {
    console.error("Usage: node scripts/check-native-icon-candidate.mjs SOURCE_PNG ICON_DIRECTORY");
    process.exitCode = 2;
  } else {
    try {
      const audit = inspectIconCandidatePaths(args[0], args[1]);
      if (!audit.valid) {
        for (const e of audit.errors) console.error("ICON GATE: " + e);
        process.exitCode = 1;
      } else {
        console.log("Source Optic 512px verified and Windows icon layers present. Rendering/Windows not verified.");
      }
    } catch (error) {
      console.error("ICON GATE: candidate could not be read: " + error.code);
      process.exitCode = 1;
    }
  }
}
