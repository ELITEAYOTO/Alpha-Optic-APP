#!/usr/bin/env node
/**
 * Strict, intentionally separate unsigned CI smoke configuration.
 * This is a packaging *configuration* guard, not Authenticode or execution proof.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

function plain(input) {
  return input !== null && typeof input === "object" && !Array.isArray(input);
}

function checkKeys(value, allowed) {
  return plain(value) && Object.keys(value).every(k => allowed.includes(k));
}

export function auditNsisSmoke(base, smoke, workflow) {
  const errors = [];
  const error = text => errors.push(text);
  if (!plain(base) || !plain(smoke) || typeof workflow !== "string") {
    return { ready: false, errors: ["Invalid NSIS smoke input"] };
  }

  if (base.productName !== "Optic" || base.bundle?.active !== false) error("The production/default bundle must stay inactive");
  if (base.identifier !== "dev.optic.desktop" || base.version !== "0.0.1") {
    error("Baseline is no longer the known 0.0.1 prototype; review smoke config before reuse");
  }
  if (base.plugins?.updater !== undefined) error("Base config must not enable an updater");
  if (!checkKeys(smoke, ["productName", "identifier", "bundle"])) error("Smoke overlay adds unexpected top-level fields");
  if (smoke.productName !== "Optic Smoke Test" || smoke.identifier !== "dev.optic.desktop.smoke") {
    error("Smoke installer must be separately identifiable from production");
  }
  if (smoke.version !== undefined || smoke.app !== undefined || smoke.plugins !== undefined) {
    error("Smoke overlay must not modify app versions, capabilities, or plugins");
  }

  const bundle = smoke.bundle;
  if (!checkKeys(bundle, ["active", "targets", "createUpdaterArtifacts", "windows"])) error("Unexpected smoke bundle settings");
  if (bundle?.active !== true || JSON.stringify(bundle?.targets) !== '["nsis"]') error("Smoke bundle must exclusively build NSIS");
  if (bundle?.createUpdaterArtifacts !== false) error("Smoke installer must never produce updater signatures");
  const windows = bundle?.windows;
  if (!checkKeys(windows, ["nsis", "webviewInstallMode"])) error("Unexpected smoke Windows settings");
  if (!checkKeys(windows?.nsis, ["installMode", "languages"]) ||
      windows?.nsis?.installMode !== "currentUser" ||
      JSON.stringify(windows?.nsis?.languages) !== '["French","English"]') {
    error("Smoke NSIS must be currentUser with only French/English");
  }
  if (!checkKeys(windows?.webviewInstallMode, ["type"]) ||
      windows?.webviewInstallMode?.type !== "downloadBootstrapper") {
    error("Smoke WebView2 mode must remain explicitly downloadBootstrapper");
  }

  const contentPermissions = [...workflow.matchAll(/^\s*contents:\s*(\w+)\s*$/gm)].map(match => match[1]);
  if (contentPermissions.length !== 1 || contentPermissions[0] !== "read") error("Workflow must have exactly one read-only contents permission");
  if (!/runs-on:\s*windows-latest/.test(workflow)) error("Smoke must build on Windows");
  if (!workflow.includes("npm run tauri -- build --ci --bundles nsis --config src-tauri/tauri.nsis-smoke.conf.json")) {
    error("Expected explicit isolated NSIS build command");
  }
  if (!workflow.includes("actions/upload-artifact@v4") ||
      !workflow.includes("UNSIGNED-DO-NOT-INSTALL") ||
      !workflow.includes("retention-days: 2")) error("Artifacts must be temporary and visibly untrusted");
  if (/\b(upload-release-asset|create-release|softprops\/action-gh-release|tauri-apps\/tauri-action|gh release|TAURI_SIGNING_PRIVATE_KEY|secrets\.)\b/i.test(workflow)) {
    error("No release publication or signing secrets are allowed in the smoke workflow");
  }
  if (!workflow.includes("if: github.event_name == 'workflow_dispatch' || github.event.pull_request.head.repo.full_name == github.repository")) {
    error("Native install/uninstall smoke must be restricted to trusted same-repository PRs or manual runs");
  }
  if (!workflow.includes("./scripts/windows/test-nsis-lifecycle.ps1") ||
      !workflow.includes("LIFECYCLE.txt") ||
      !workflow.includes("Exercise silent install/uninstall on ephemeral GitHub-hosted Windows ONLY")) {
    error("NSIS lifecycle test must run and produce a report on an ephemeral runner");
  }
  if (!workflow.includes("Get-FileHash") || !workflow.includes("Get-AuthenticodeSignature")) {
    error("Artifact provenance must record checksum and signature state");
  }
  return { ready: errors.length === 0, errors };
}

export function inspectNsisSmoke() {
  const root = fileURLToPath(new URL("../", import.meta.url));
  return auditNsisSmoke(
    JSON.parse(readFileSync(resolve(root, "src-tauri/tauri.conf.json"), "utf8")),
    JSON.parse(readFileSync(resolve(root, "src-tauri/tauri.nsis-smoke.conf.json"), "utf8")),
    readFileSync(resolve(root, ".github/workflows/windows-nsis-smoke.yml"), "utf8"),
  );
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const result = inspectNsisSmoke();
  if (!result.ready) {
    for (const e of result.errors) console.error("NSIS SMOKE GATE: " + e);
    process.exitCode = 1;
  } else {
    console.log("NSIS smoke config accepted (NOT signed, installed, or release-ready)");
  }
}
