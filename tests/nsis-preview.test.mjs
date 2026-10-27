import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { auditNsisPreview, inspectNsisPreview } from "../scripts/check-nsis-preview.mjs";

const base = () => ({
  productName: "Optic",
  identifier: "dev.optic.desktop",
  version: "0.0.1",
  bundle: { active: false },
  app: { windows: [{ label: "main", width: 1440, height: 900, minWidth: 980 }] },
});
const preview = () => ({
  productName: "Optic Preview",
  identifier: "dev.optic.desktop.preview",
  bundle: {
    active: true,
    targets: ["nsis"],
    createUpdaterArtifacts: false,
    windows: {
      nsis: { installMode: "currentUser", languages: ["French", "English"] },
      webviewInstallMode: { type: "downloadBootstrapper" },
    },
  },
});
const workflow = () => [
  "permissions:",
  "  contents: read",
  "runs-on: windows-latest",
  "npm run check",
  "npm run tauri -- build --ci --bundles nsis --config src-tauri/tauri.nsis-preview.conf.json",
  "if: github.event_name == 'workflow_dispatch' || github.event.pull_request.head.repo.full_name == github.repository",
  "uses: actions/upload-artifact@v4",
  "name: PRIVATE-UNSIGNED-OPTIC-PREVIEW",
  "retention-days: 2",
  "Get-FileHash",
  "Get-AuthenticodeSignature",
  "NotSigned",
  "./scripts/windows/test-nsis-preview-lifecycle.ps1",
  "preview-dist/LIFECYCLE.txt",
  "'scripts/windows/test-nsis-preview-lifecycle.ps1'",
  "'scripts/windows/test-nsis-preview-gui.ps1'",
].join("\n");

test("repository Preview candidate remains separated, unsigned and without updater", () => {
  assert.deepEqual(inspectNsisPreview(), { ready: true, errors: [] });
});

test("Preview is an additive packaging flavour and must never erase the base window", () => {
  const mutations = [
    x => { x.app = { windows: [{ label: "main", title: "Optic" }] }; },
    x => { x.version = "1.0.0"; },
    x => { x.plugins = { updater: {} }; },
    x => { x.identifier = "dev.optic.desktop"; },
    x => { x.productName = "Optic"; },
    x => { x.bundle.targets = ["nsis", "msi"]; },
    x => { x.bundle.windows.nsis.installMode = "both"; },
    x => { x.bundle.windows.nsis.languages = ["English"]; },
    x => { x.bundle.windows.nsis.template = "untrusted.nsi"; },
    x => { x.bundle.windows.webviewInstallMode.type = "skip"; },
    x => { x.bundle.createUpdaterArtifacts = true; },
    x => { x.bundle.windows.webviewInstallMode.silent = true; },
  ];
  for (const change of mutations) {
    const candidate = preview();
    change(candidate);
    assert.equal(auditNsisPreview(base(), candidate, workflow()).ready, false);
  }
});

test("Preview cannot turn on the default distributor, or silently change the baseline", () => {
  const changed = base();
  changed.bundle.active = true;
  assert.equal(auditNsisPreview(changed, preview(), workflow()).ready, false);
  const changedVersion = base();
  changedVersion.version = "1.0.0";
  assert.equal(auditNsisPreview(changedVersion, preview(), workflow()).ready, false);
});

test("Preview workflow refuses publishing, secrets, elevated permissions or untrusted PRs", () => {
  for (const addition of [
    "uses: softprops/action-gh-release@v2",
    "gh release create",
    "secrets.TAURI_SIGNING_PRIVATE_KEY",
    "Start-Process setup.exe",
    "test-nsis-lifecycle.ps1",
    "pull_request_target:",
    "permissions:\n  contents: write",
    "id-token: write",
  ]) {
    assert.equal(auditNsisPreview(base(), preview(), workflow() + "\n" + addition).ready, false);
  }
  assert.equal(auditNsisPreview(base(), preview(), workflow().replace("./scripts/windows/test-nsis-preview-lifecycle.ps1", "echo skipped")).ready, false);
  const unsafe = workflow().replace(
    "github.event.pull_request.head.repo.full_name == github.repository",
    "always()",
  );
  assert.equal(auditNsisPreview(base(), preview(), unsafe).ready, false);
});

test("hosted Preview smoke requires two bounded clean-install cycles and preserves external synthetic state", () => {
  const source = readFileSync(new URL("../scripts/windows/test-nsis-preview-lifecycle.ps1", import.meta.url), "utf8");
  for (const required of [
    "$env:RUNNER_ENVIRONMENT -ne 'github-hosted'",
    "$env:GITHUB_REPOSITORY -ne 'ELITEAYOTO/Alpha-Optic-APP'",
    "Refusing to execute anything except the exact CI-produced Optic Preview installer.",
    "Get-AuthenticodeSignature",
    "Join-Path $env:APPDATA 'dev.optic.desktop.preview'",
    "An Optic Preview installation already exists; refusing to replace it.",
    "Confirm-SyntheticProfile",
    "Initial NSIS Preview installation",
    "Initial NSIS Preview uninstallation",
    "Clean reinstallation of Optic Preview",
    "Second NSIS Preview uninstallation",
    "test-nsis-preview-gui.ps1",
    "Installed Preview native GUI/WebView2 startup:",
    "Real Optic settings/cross-PC sync/version upgrade: NOT TESTED",
    "Optic AI Bridge / user PC: NOT TOUCHED",
  ]) {
    assert.ok(source.includes(required), `Missing NSIS safety/proof marker: ${required}`);
  }
  assert.doesNotMatch(source, /Remove-Item[^\r\n]*-Recurse\b/i);
  assert.match(source, /\$firstInstalled -and \$firstRemoved -and \$probeCreated -and \$errors.Count -eq 0/);
  assert.match(source, /\$probeKept -and \$previewGui\)/);
});

test("Preview GUI startup proof checks the exact installed app and independently-owned WebView2", () => {
  const source = readFileSync(new URL("../scripts/windows/test-nsis-preview-gui.ps1", import.meta.url), "utf8");
  for (const required of [
    "$env:RUNNER_ENVIRONMENT -ne 'github-hosted'",
    "$env:GITHUB_REPOSITORY -ne 'ELITEAYOTO/Alpha-Optic-APP'",
    "Join-Path $env:LOCALAPPDATA 'Optic Preview'",
    "preview-dist",
    "PREVIEW_GUI_LAUNCH.txt",
    "Get-AuthenticodeSignature",
    "MainWindowHandle",
    "ParentProcessId",
    "msedgewebview2.exe",
    "CloseMainWindow()",
    "Kill($true)",
    "React content/navigation verified: NO",
    "User PC: NOT ACCESSED",
  ]) {
    assert.ok(source.includes(required), `Missing Preview GUI security/evidence marker: ${required}`);
  }
  assert.doesNotMatch(source, /-WindowStyle\s+Hidden|-ExecutionPolicy\s+Bypass/);
});
