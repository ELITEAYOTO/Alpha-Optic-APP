import test from "node:test";
import assert from "node:assert/strict";
import {
  auditReleaseConfig,
  cargoPackageVersion,
  inspectCurrentReleaseConfig,
  isSafeUpdateEndpoint,
} from "../scripts/check-release-gates.mjs";

const pkg = version => ({ name: "optic-desktop", version });
const cargo = version => '[package]\nname = "optic-desktop"\nversion = "' + version + '"\n\n[dependencies]\nother = "99.9.9"\n';
const prototype = () => ({
  packageJson: pkg("0.0.1"),
  cargoToml: cargo("0.0.1"),
  tauriConfig: {
    productName: "Optic",
    version: "0.0.1",
    identifier: "dev.optic.desktop",
    bundle: { active: false },
  },
});
const candidate = () => ({
  packageJson: pkg("1.0.0"),
  cargoToml: cargo("1.0.0"),
  tauriConfig: {
    productName: "Optic",
    version: "1.0.0",
    identifier: "app.optic.desktop",
    bundle: {
      active: true,
      targets: ["nsis"],
      windows: { nsis: { installMode: "currentUser" }, webviewInstallMode: { type: "downloadBootstrapper" } },
      createUpdaterArtifacts: true,
    },
    plugins: {
      updater: {
        // Test-only public key-shaped data; the configuration gate NEVER verifies cryptography.
        pubkey: "untrusted comment: minisign public key\n" + "A".repeat(80),
        endpoints: ["https://github.com/ELITEAYOTO/Alpha-Optic-APP/releases/latest/download/latest.json"],
        windows: { installMode: "basicUi" },
      },
    },
  },
});

test("read package version only from [package], not dependency version", () => {
  assert.equal(cargoPackageVersion(cargo("1.2.3")), "1.2.3");
  assert.equal(cargoPackageVersion('[dependencies]\nother = "9.9.9"\n'), null);
  assert.equal(cargoPackageVersion(""), null);
});

test("current repository is safe prototype, but fails the explicit distribution gate", () => {
  const current = inspectCurrentReleaseConfig();
  assert.equal(current.mode, "prototype");
  assert.equal(current.ready, true);
  const release = inspectCurrentReleaseConfig({ requireDistribution: true });
  assert.equal(release.ready, false);
  assert.ok(release.problems.some(x => x.includes("bundle.active=false")));
});

test("fail closed on split versions, unknown bundle mode and hidden updater in prototype", () => {
  const versions = prototype();
  versions.tauriConfig.version = "0.0.2";
  assert.equal(auditReleaseConfig(versions).ready, false);
  const hidden = prototype();
  hidden.tauriConfig.plugins = { updater: { endpoints: ["https://github.com"] } };
  assert.equal(auditReleaseConfig(hidden).ready, false);
  const invalid = prototype();
  invalid.tauriConfig.bundle.active = "true";
  assert.equal(auditReleaseConfig(invalid).mode, "invalid");
  assert.equal(auditReleaseConfig(invalid).ready, false);
  for (const version of ["01.2.3", "v1.2.3", "1.2", "1.2.3+meta", "1.2.3-", "../release"]) {
    const malformed = prototype();
    malformed.packageJson.version = version;
    malformed.tauriConfig.version = version;
    malformed.cargoToml = cargo(version);
    assert.equal(auditReleaseConfig(malformed).ready, false, version);
  }
});

test("accept only concrete secure HTTPS release endpoints with Tauri variables", () => {
  const accepted = [
    "https://github.com/ELITEAYOTO/Alpha-Optic-APP/releases/latest/download/latest.json",
    "https://updates.optic.app/{{target}}/{{arch}}/{{current_version}}",
  ];
  for (const url of accepted) assert.equal(isSafeUpdateEndpoint(url), true, url);
  for (const url of [
    "http://updates.optic.app/latest.json",
    "https://localhost/latest.json",
    "https://127.0.0.1/latest.json",
    "https://updates.local/latest.json",
    "https://updates.example/latest.json",
    "https://user:password@updates.optic.app/latest.json",
    "https://updates.optic.app/latest.json#frag",
    "https://updates.optic.app:8443/latest.json",
    "https://updates.optic.app/{{token}}",
    "file:///tmp/latest.json",
    "javascript:alert(1)",
  ]) assert.equal(isSafeUpdateEndpoint(url), false, url);
});

test("candidate rejects incomplete signing, URLs, Windows prompts and installer config", () => {
  assert.deepEqual(auditReleaseConfig(candidate()), { mode: "candidate", ready: true, problems: [] });
  const mutate = fn => {
    const x = candidate();
    fn(x.tauriConfig);
    const audit = auditReleaseConfig(x);
    assert.equal(audit.mode, "candidate");
    assert.equal(audit.ready, false);
  };
  mutate(c => { c.identifier = "dev.optic.desktop"; });
  mutate(c => { c.bundle.targets = "all"; });
  mutate(c => { c.bundle.createUpdaterArtifacts = false; });
  mutate(c => { c.bundle.windows.nsis.installMode = "perMachine"; });
  mutate(c => { c.bundle.windows.webviewInstallMode.type = "skip"; });
  // Minisign public keys can legitimately contain base64 "/" characters.
  const withSlash = candidate();
  withSlash.tauriConfig.plugins.updater.pubkey += "AA/BB";
  assert.equal(auditReleaseConfig(withSlash).ready, true);
  mutate(c => { c.plugins.updater.pubkey = "CONTENT FROM PUBLICKEY.PEM"; });
  mutate(c => { c.plugins.updater.pubkey = "./secrets/updater.pub"; });
  mutate(c => { c.plugins.updater.endpoints = ["https://updates.optic.app", "https://fallback.optic.app"]; });
  mutate(c => { c.plugins.updater.endpoints = ["http://updates.optic.app"]; });
  mutate(c => { c.plugins.updater.windows.installMode = "quiet"; });
  mutate(c => { c.plugins.updater.dangerousInsecureTransportProtocol = true; });
});


test("manual Preview config is separate from automatic signed updater configuration", () => {
  const manual = candidate();
  manual.tauriConfig.productName = "Optic Preview";
  manual.tauriConfig.identifier = "app.optic.desktop.preview";
  manual.tauriConfig.bundle.windows.allowDowngrades = false;
  manual.tauriConfig.bundle.createUpdaterArtifacts = false;
  delete manual.tauriConfig.plugins;

  assert.deepEqual(auditReleaseConfig(manual, { manualPreview: true }), {
    mode: "manual-preview-candidate", ready: true, problems: [],
  });
  // The ordinary updater-required release must still reject this overlay.
  assert.equal(auditReleaseConfig(manual, { requireDistribution: true }).ready, false);

  const bad = (mutate) => {
    const data = structuredClone(manual);
    mutate(data);
    assert.equal(auditReleaseConfig(data, { manualPreview: true }).ready, false);
  };
  bad(x => { x.tauriConfig.bundle.windows.allowDowngrades = true; });
  bad(x => { delete x.tauriConfig.bundle.windows.allowDowngrades; });
  bad(x => { x.tauriConfig.bundle.createUpdaterArtifacts = true; });
  bad(x => { x.tauriConfig.plugins = { updater: { endpoints: ["https://example.com"] } }; });
  bad(x => { x.tauriConfig.identifier = "dev.optic.desktop.preview"; });
  bad(x => { x.tauriConfig.productName = "Optic"; });
  bad(x => { x.tauriConfig.bundle.windows.webviewInstallMode.type = "skip"; });
  bad(x => { delete x.tauriConfig.bundle.windows.webviewInstallMode; });
  bad(x => { x.tauriConfig.bundle.windows.nsis.installMode = "both"; });
  bad(x => { x.packageJson.version = "0.0.1"; x.cargoToml = cargo("0.0.1"); x.tauriConfig.version = "0.0.1"; });
  bad(x => { x.tauriConfig.version = "9.0.0"; });

  const baseline = inspectCurrentReleaseConfig({ manualPreview: true });
  assert.equal(baseline.ready, false);
  assert.equal(baseline.mode, "prototype");
});
