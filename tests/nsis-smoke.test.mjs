import test from "node:test";
import assert from "node:assert/strict";
import { auditNsisSmoke, inspectNsisSmoke } from "../scripts/check-nsis-smoke.mjs";

const base = () => ({
  productName: "Optic", identifier: "dev.optic.desktop", version: "0.0.1",
  bundle: { active: false },
});
const smoke = () => ({
  productName: "Optic Smoke Test",
  identifier: "dev.optic.desktop.smoke",
  bundle: {
    active: true, targets: ["nsis"], createUpdaterArtifacts: false,
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
  "npm run tauri -- build --ci --bundles nsis --config src-tauri/tauri.nsis-smoke.conf.json",
  "uses: actions/upload-artifact@v4",
  "name: UNSIGNED-DO-NOT-INSTALL",
  "retention-days: 2",
  "Get-FileHash",
  "Get-AuthenticodeSignature",
].join("\n");

test("repository smoke overlay is explicitly unsigned and isolated from default config", () => {
  assert.deepEqual(inspectNsisSmoke(), { ready: true, errors: [] });
});

test("smoke guard rejects release settings, updater side effects and privileges", () => {
  const mutations = [
    x => { x.bundle.targets = ["msi", "nsis"]; },
    x => { x.bundle.windows.nsis.installMode = "both"; },
    x => { x.bundle.windows.nsis.languages = ["English"]; },
    x => { x.bundle.windows.webviewInstallMode.type = "skip"; },
    x => { x.bundle.createUpdaterArtifacts = true; },
    x => { x.identifier = "dev.optic.desktop"; },
    x => { x.plugins = { updater: { pubkey: "should not be here" } }; },
    x => { x.bundle.windows.nsis.template = "scripts/install-untrusted.nsi"; },
  ];
  for (const mutate of mutations) {
    const candidate = smoke();
    mutate(candidate);
    assert.equal(auditNsisSmoke(base(), candidate, workflow()).ready, false);
  }
});

test("smoke guard refuses release actions, signing keys and broad GitHub tokens", () => {
  for (const addition of [
    "secrets.TAURI_SIGNING_PRIVATE_KEY",
    "uses: softprops/action-gh-release@v2",
    "gh release create",
    "permissions:\n  contents: write",
  ]) {
    assert.equal(auditNsisSmoke(base(), smoke(), workflow() + "\n" + addition).ready, false);
  }
  const privileged = workflow().replace("contents: read", "contents: write");
  assert.equal(auditNsisSmoke(base(), smoke(), privileged).ready, false);
  const enabled = base();
  enabled.bundle.active = true;
  assert.equal(auditNsisSmoke(enabled, smoke(), workflow()).ready, false);
});
