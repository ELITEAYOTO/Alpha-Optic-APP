import test from "node:test";
import assert from "node:assert/strict";
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
  const unsafe = workflow().replace(
    "github.event.pull_request.head.repo.full_name == github.repository",
    "always()",
  );
  assert.equal(auditNsisPreview(base(), preview(), unsafe).ready, false);
});
