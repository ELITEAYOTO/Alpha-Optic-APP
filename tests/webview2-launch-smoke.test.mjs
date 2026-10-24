import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const helper = readFileSync(new URL("../scripts/windows/test-webview2-launch.ps1", import.meta.url), "utf8");
const lifecycle = readFileSync(new URL("../scripts/windows/test-nsis-lifecycle.ps1", import.meta.url), "utf8");
const workflow = readFileSync(new URL("../.github/workflows/windows-nsis-smoke.yml", import.meta.url), "utf8");

test("GUI helper can only run on GitHub-hosted Windows for Desktop smoke", () => {
  for (const marker of ["GITHUB_ACTIONS", "RUNNER_ENVIRONMENT", "github-hosted",
                       "RUNNER_OS", "GITHUB_REPOSITORY", "ELITEAYOTO/Alpha-Optic-APP",
                       "Optic Smoke Test", "NotSigned"]) {
    assert.ok(helper.includes(marker), marker);
  }
  assert.match(helper, /MainWindowHandle/);
  assert.match(helper, /ParentProcessId/);
  assert.match(helper, /msedgewebview2\.exe/i);
  assert.match(helper, /Kill\(\$true\)/);
  assert.match(helper, /Get-AuthenticodeSignature/);
  assert.match(helper, /WaitForExit\(10000\)/);
});

test("lifecycle observes GUI before uninstall, fails closed and labels untested UI", () => {
  assert.ok(lifecycle.indexOf("test-webview2-launch.ps1") > 0);
  assert.ok(lifecycle.indexOf("Invoke-BoundedProcess $uninstaller") > lifecycle.indexOf("test-webview2-launch.ps1"));
  assert.match(lifecycle, /-and \$guiLaunch/);
  assert.match(lifecycle, /-not \$guiLaunch/);
  assert.match(helper, /React content\/navigation verified: NO/);
  assert.match(helper, /WebView2 missing\/offline scenario: NOT TESTED/);
  assert.match(workflow, /'scripts\/windows\/test-webview2-launch\.ps1'/);
});
