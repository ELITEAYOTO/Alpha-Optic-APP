import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const here = relative => readFileSync(new URL(relative, import.meta.url), "utf8");
const workflow = here("../.github/workflows/windows-nsis-upgrade-smoke.yml");
const script = here("../scripts/windows/test-nsis-preview-upgrade.ps1");
const overlay = JSON.parse(here("../src-tauri/tauri.nsis-upgrade-test.conf.json"));
const baseline = JSON.parse(here("../src-tauri/tauri.conf.json"));
const preview = JSON.parse(here("../src-tauri/tauri.nsis-preview.conf.json"));

test("the version-0.0.2 overlay changes exactly the version and not product identity", () => {
  assert.deepEqual(overlay, { version: "0.0.2" });
  assert.equal(baseline.version, "0.0.1");
  assert.equal(baseline.bundle.active, false);
  assert.equal(preview.productName, "Optic Preview");
  assert.equal(preview.identifier, "dev.optic.desktop.preview");
  assert.equal(preview.bundle.windows.allowDowngrades, false);
  assert.equal(preview.bundle.windows.nsis.installMode, "currentUser");
  assert.equal(preview.bundle.createUpdaterArtifacts, false);
  assert.equal(preview.plugins, undefined);
});

test("two-version smoke uses one trusted runner and publishes only text evidence", () => {
  for (const required of [
    "runs-on: windows-latest",
    "contents: read",
    "github.event.pull_request.head.repo.full_name == github.repository",
    "npm run check",
    "src-tauri/tauri.nsis-upgrade-test.conf.json",
    "Build CI-only version 0.0.1 NSIS",
    "Build CI-only version 0.0.2 NSIS",
    "--config src-tauri/tauri.nsis-preview.conf.json --config src-tauri/tauri.nsis-upgrade-test.conf.json",
    "Get-AuthenticodeSignature",
    "test-nsis-preview-upgrade.ps1",
    "NSIS-TEST-REPORT-ONLY-",
    "path: upgrade-smoke-results/UPGRADE.txt",
    "retention-days: 7",
  ]) {
    assert.ok(workflow.includes(required), "Missing trusted CI transition marker: " + required);
  }
  assert.doesNotMatch(workflow, /pull_request_target\s*:|workflow_run\s*:|contents:\s*write|secrets\.|TAURI_SIGNING_PRIVATE_KEY|gh\s+release|action-gh-release/i);
  assert.doesNotMatch(workflow, /(?:^|\s)path:\s*.*(?:\.exe|bundle\/nsis)/i);
  assert.equal((workflow.match(/npm run tauri -- build --ci --bundles nsis/g) || []).length, 2);
});

test("version transition verifies registry, scoped files, AppData sentinel and rollback refusal", () => {
  for (const required of [
    "$env:GITHUB_ACTIONS -ne 'true'",
    "$env:RUNNER_ENVIRONMENT -ne 'github-hosted'",
    "$env:GITHUB_REPOSITORY -ne 'ELITEAYOTO/Alpha-Optic-APP'",
    "Optic Preview_0.0.1_x64-setup.exe",
    "Optic Preview_0.0.2_x64-setup.exe",
    "Get-AuthenticodeSignature",
    "Get-FileHash",
    "HKCU:",
    "HKLM:",
    "Check-Installed '0.0.1'",
    "Check-Installed '0.0.2'",
    "Check-Sentinel",
    "Attempt silent downgrade to 0.0.1",
    "Get-ChildItem -LiteralPath $profileDir -Force",
    "UPGRADE.txt",
    "NOT TESTED",
    "No installation performed on a user PC",
  ]) {
    assert.ok(script.includes(required), "Missing install safety/proof marker: " + required);
  }
  assert.match(script, /\$downgradeBlocked = \$true/);
  assert.match(script, /\$errors\.Count -eq 0 -and \$installedOld -and \$upgradedNew -and/);
  assert.doesNotMatch(script, /Remove-Item[^\r\n]*-Recurse\b/);
  assert.doesNotMatch(script, /Invoke-WebRequest|Start-BitsTransfer|Set-AuthenticodeSignature/i);
});
