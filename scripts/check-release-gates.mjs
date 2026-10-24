#!/usr/bin/env node
/**
 * Release configuration gate. Deliberately NOT a cryptographic signature,
 * built-installer, release-server, or Windows installation verification.
 *
 * Normal mode accepts the current offline prototype. --release requires
 * a complete candidate config and deliberately fails until distribution is
 * separately built, signed, tested, and approved.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SEMVER = /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-(?:0|[1-9]\d*|[0-9A-Za-z-]*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|[0-9A-Za-z-]*[A-Za-z-][0-9A-Za-z-]*))*)?$/;

function object(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value : {};
}

export function cargoPackageVersion(contents) {
  if (typeof contents !== "string") return null;
  const match = contents.match(/^\[package\]\s*\r?\n([\s\S]*?)(?=^\[|\s*$)/m);
  // Stop after the [package] table, not after a possible transitive dep version.
  const section = match?.[1];
  if (!section) return null;
  const line = section.match(/^version\s*=\s*"([^"\r\n]+)"\s*(?:#.*)?$/m);
  return line?.[1] ?? null;
}

export function isSafeUpdateEndpoint(endpoint) {
  if (typeof endpoint !== "string" || endpoint.length > 2048 || endpoint.trim() !== endpoint) return false;
  if (/[^\x20-\x7e]/.test(endpoint)) return false;
  // Tauri supports exactly these templated segments; other replacements
  // require explicit review.
  const stripped = endpoint.replaceAll("{{current_version}}", "1.0.0")
    .replaceAll("{{target}}", "windows").replaceAll("{{arch}}", "x86_64");
  if (/[{}]/.test(stripped)) return false;
  try {
    const url = new URL(stripped);
    return url.protocol === "https:" && !url.username && !url.password &&
      !url.hash && !url.port && url.hostname.includes(".") &&
      !/^(?:localhost|127\.|0\.|10\.|192\.168\.|169\.254\.)/.test(url.hostname) &&
      !url.hostname.endsWith(".localhost") && !url.hostname.endsWith(".local") &&
      !url.hostname.endsWith(".example") && !url.hostname.endsWith(".invalid");
  } catch {
    return false;
  }
}

export function auditReleaseConfig({ packageJson, cargoToml, tauriConfig }, { requireDistribution = false } = {}) {
  const problems = [];
  const pkg = object(packageJson);
  const config = object(tauriConfig);
  const bundle = object(config.bundle);
  const version = pkg.version;
  const tauriVersion = config.version;
  const cargoVersion = cargoPackageVersion(cargoToml);
  if (typeof version !== "string" || version.length > 96 || !SEMVER.test(version)) {
    problems.push("package.json: version SemVer invalide");
  }
  if (version !== tauriVersion || version !== cargoVersion) {
    problems.push("Versions divergentes : package.json, tauri.conf.json et Cargo.toml doivent correspondre");
  }
  if (pkg.name !== "optic-desktop" || config.productName !== "Optic") {
    problems.push("Identité produit Optic incohérente");
  }

  let mode = "invalid";
  if (bundle.active === false) {
    mode = "prototype";
    if (bundle.createUpdaterArtifacts || object(config.plugins).updater !== undefined) {
      problems.push("Prototype désactivé : ne pas laisser d'updater actif ou d'artefacts signés configurés");
    }
    if (requireDistribution) problems.push("Aucune distribution : bundle.active=false");
  } else if (bundle.active === true) {
    mode = "candidate";
    if (config.identifier === "dev.optic.desktop" ||
        typeof config.identifier !== "string" ||
        !/^[a-zA-Z][a-zA-Z\d-]*(?:\.[a-zA-Z][a-zA-Z\d-]*){2,}$/.test(config.identifier)) {
      problems.push("Identifiant de production absent ou provisoire");
    }
    if (version === "0.0.1") problems.push("Version expérimentale 0.0.1 interdite en distribution");
    if (!(bundle.targets === "nsis" ||
        (Array.isArray(bundle.targets) && bundle.targets.length === 1 && bundle.targets[0] === "nsis"))) {
      problems.push("Distribution Windows : cibler explicitement NSIS uniquement");
    }
    if (object(object(bundle.windows).nsis).installMode !== "currentUser") {
      problems.push("Installateur NSIS : currentUser explicite requis pour le profil prévu");
    }
    if (object(object(bundle.windows).webviewInstallMode).type === "skip") {
      problems.push("Installateur NSIS : impossible d'ignorer le prérequis WebView2");
    }
    if (bundle.createUpdaterArtifacts !== true) {
      problems.push("Bundle candidat : createUpdaterArtifacts doit être true (Tauri v2)");
    }
    const updater = object(object(config.plugins).updater);
    const pubkey = updater.pubkey;
    if (typeof pubkey !== "string" || pubkey.trim().length < 80 ||
        /PLACEHOLDER|YOUR_|CONTENT FROM|BEGIN PRIVATE KEY/i.test(pubkey) ||
        pubkey.includes("/") || pubkey.includes("\\")) {
      problems.push("Clé PUBLIQUE updater réelle requise dans la config (jamais une clé privée ni un chemin)");
    }
    if (!Array.isArray(updater.endpoints) || updater.endpoints.length !== 1 ||
        !isSafeUpdateEndpoint(updater.endpoints[0])) {
      problems.push("Un endpoint de release HTTPS de production est requis");
    }
    if (updater.dangerousInsecureTransportProtocol === true) {
      problems.push("Transport updater non sûr explicitement interdit");
    }
    if (!["passive", "basicUi"].includes(object(updater.windows).installMode)) {
      problems.push("Updater Windows : installMode visible, passive ou basicUi requis");
    }
  } else {
    problems.push("bundle.active doit être un booléen explicite");
  }
  return Object.freeze({ mode, ready: problems.length === 0, problems: Object.freeze(problems) });
}

export function inspectCurrentReleaseConfig(options) {
  const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
  const packageJson = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
  const cargoToml = readFileSync(resolve(root, "src-tauri/Cargo.toml"), "utf8");
  const tauriConfig = JSON.parse(readFileSync(resolve(root, "src-tauri/tauri.conf.json"), "utf8"));
  return auditReleaseConfig({ packageJson, cargoToml, tauriConfig }, options);
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const args = process.argv.slice(2);
  if (args.some(x => x !== "--release")) {
    console.error("Usage: node scripts/check-release-gates.mjs [--release]");
    process.exitCode = 2;
  } else {
    const result = inspectCurrentReleaseConfig({ requireDistribution: args.includes("--release") });
    if (!result.ready) {
      for (const issue of result.problems) console.error("RELEASE GATE: " + issue);
      process.exitCode = 1;
    } else {
      console.log("Optic " + result.mode + " config: source checks OK; no signature/install verification performed");
    }
  }
}
