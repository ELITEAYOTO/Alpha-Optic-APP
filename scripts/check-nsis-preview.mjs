#!/usr/bin/env node
/**
 * Static guard for the separate unsigned Optic Preview installer candidate.
 *
 * Does NOT qualify an installer for real devices, or verify Tauri signatures.
 * Keep the normal demo config disabled and never publish preview CI artifacts.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

function record(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasOnlyKeys(value, keys) {
  return record(value) && Object.keys(value).every(key => keys.includes(key));
}

export function auditNsisPreview(base, preview, workflow) {
  const errors = [];
  const error = message => errors.push(message);
  if (!record(base) || !record(preview) || typeof workflow !== "string") {
    return { ready: false, errors: ["Invalid NSIS preview input"] };
  }

  if (base.productName !== "Optic" || base.bundle?.active !== false ||
      base.identifier !== "dev.optic.desktop" || base.version !== "0.0.1" ||
      base.plugins?.updater !== undefined) {
    error("Preview requires the known offline 0.0.1 baseline; review before changing it");
  }
  if (!Array.isArray(base.app?.windows) || base.app.windows.length !== 1) {
    error("Base window definition must remain owned by the normal Tauri config");
  }

  // Tauri merges via RFC 7396, so a partial app.windows array would discard
  // original geometry and window settings. Keep this strictly a bundle flavour.
  if (!hasOnlyKeys(preview, ["productName", "identifier", "bundle"])) {
    error("Preview may only override productName, identifier and bundle");
  }
  if (preview.productName !== "Optic Preview" ||
      preview.identifier !== "dev.optic.desktop.preview") {
    error("Preview must use a separate, explicitly provisional identity");
  }
  const bundle = preview.bundle;
  if (!hasOnlyKeys(bundle, ["active", "targets", "createUpdaterArtifacts", "windows"]) ||
      bundle?.active !== true || JSON.stringify(bundle?.targets) !== '["nsis"]' ||
      bundle?.createUpdaterArtifacts !== false) {
    error("Preview must build only an unsigned NSIS bundle, without updater artifacts");
  }
  const windows = bundle?.windows;
  if (!hasOnlyKeys(windows, ["nsis", "webviewInstallMode"])) {
    error("Unexpected Windows packaging configuration");
  }
  if (!hasOnlyKeys(windows?.nsis, ["installMode", "languages"]) ||
      windows?.nsis?.installMode !== "currentUser" ||
      JSON.stringify(windows?.nsis?.languages) !== '["French","English"]') {
    error("NSIS Preview must stay currentUser, French/English");
  }
  if (!hasOnlyKeys(windows?.webviewInstallMode, ["type"]) ||
      windows?.webviewInstallMode?.type !== "downloadBootstrapper") {
    error("Preview must explicitly handle WebView2 with downloadBootstrapper");
  }

  const contentPermissions = [...workflow.matchAll(/^\s*contents:\s*(\w+)\s*$/gm)]
    .map(match => match[1]);
  if (contentPermissions.length !== 1 || contentPermissions[0] !== "read" ||
      /\b(id-token|actions|checks|deployments|packages):\s*write\b/i.test(workflow)) {
    error("Workflow token must be read-only");
  }
  if (!workflow.includes("runs-on: windows-latest") ||
      !workflow.includes("npm run check") ||
      !workflow.includes("npm run tauri -- build --ci --bundles nsis --config src-tauri/tauri.nsis-preview.conf.json")) {
    error("Expected Windows-hosted checked build with explicit preview config");
  }
  if (!workflow.includes("if: github.event_name == 'workflow_dispatch' || github.event.pull_request.head.repo.full_name == github.repository") ||
      /\bpull_request_target\s*:|\bworkflow_run\s*:/m.test(workflow)) {
    error("Preview must run only in trusted same-repository PRs or manual dispatch");
  }
  if (!workflow.includes("./scripts/windows/test-nsis-preview-lifecycle.ps1") ||
      !workflow.includes("preview-dist/LIFECYCLE.txt") ||
      !workflow.includes("'scripts/windows/test-nsis-preview-lifecycle.ps1'") ||
      !workflow.includes("'scripts/windows/test-nsis-preview-gui.ps1'")) {
    error("Preview must verify install/uninstall and native GUI on trusted hosted Windows");
  }
  if (!workflow.includes("'scripts/windows/verify-optic-installer.ps1'") ||
      !workflow.includes("./scripts/windows/verify-optic-installer.ps1") ||
      !workflow.includes("Verify release preflight refuses the unsigned CI-only setup") ||
      !workflow.includes("Critical: unsigned Preview setup passed the release verification gate")) {
    error("Unsigned Preview must be rejected by the future signed-release verifier");
  }
  if (!workflow.includes("actions/upload-artifact@v4") ||
      !workflow.includes("PRIVATE-UNSIGNED-OPTIC-PREVIEW") ||
      !workflow.includes("retention-days: 2") ||
      !workflow.includes("Get-FileHash") ||
      !workflow.includes("Get-AuthenticodeSignature") ||
      !workflow.includes("NotSigned")) {
    error("Temporary artefact provenance and explicit unsigned status are required");
  }
  if (/\b(softprops\/action-gh-release|tauri-apps\/tauri-action|gh\s+release|create-release|upload-release-asset|TAURI_SIGNING_PRIVATE_KEY|secrets\.|Start-Process|Invoke-Expression|test-nsis-lifecycle\.ps1)\b/i.test(workflow)) {
    error("Preview workflow must not publish releases, use signing secrets or install executables");
  }
  return { ready: errors.length === 0, errors };
}

export function inspectNsisPreview() {
  const root = fileURLToPath(new URL("../", import.meta.url));
  return auditNsisPreview(
    JSON.parse(readFileSync(resolve(root, "src-tauri/tauri.conf.json"), "utf8")),
    JSON.parse(readFileSync(resolve(root, "src-tauri/tauri.nsis-preview.conf.json"), "utf8")),
    readFileSync(resolve(root, ".github/workflows/windows-nsis-preview.yml"), "utf8"),
  );
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const result = inspectNsisPreview();
  if (!result.ready) {
    for (const message of result.errors) console.error("NSIS PREVIEW GATE: " + message);
    process.exitCode = 1;
  } else {
    console.log("Optic Preview NSIS configuration accepted (NOT a signed, installed or distributable release)");
  }
}
