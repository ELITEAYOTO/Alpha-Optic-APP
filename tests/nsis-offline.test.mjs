import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = path => readFileSync(new URL(path, import.meta.url), "utf8");
const overlay = JSON.parse(read("../src-tauri/tauri.nsis-offline-test.conf.json"));
const preview = JSON.parse(read("../src-tauri/tauri.nsis-preview.conf.json"));
const workflow = read("../.github/workflows/windows-nsis-preview-offline.yml");

test("offline WebView2 is the ONLY override; private unsigned Preview stays intact", () => {
  assert.deepEqual(overlay, { bundle: { windows: { webviewInstallMode: { type: "offlineInstaller" } } } });
  assert.equal(preview.bundle.windows.webviewInstallMode.type, "downloadBootstrapper");
  assert.equal(preview.bundle.windows.nsis.installMode, "currentUser");
  assert.deepEqual(preview.bundle.windows.nsis.languages, ["French", "English"]);
  assert.equal(preview.bundle.windows.allowDowngrades, false);
  assert.equal(preview.bundle.createUpdaterArtifacts, false);
  assert.equal(preview.identifier, "dev.optic.desktop.preview");
});

test("offline build checks actual oversized payload and complete CI lifecycle without distributing setup", () => {
  for (const mark of [
    "workflow_dispatch:",
    "runs-on: windows-latest",
    "contents: read",
    "github.event.pull_request.head.repo.full_name == github.repository",
    "src-tauri/tauri.nsis-offline-test.conf.json",
    "npm run check",
    "--config src-tauri/tauri.nsis-preview.conf.json --config src-tauri/tauri.nsis-offline-test.conf.json",
    "50MB",
    "Get-AuthenticodeSignature",
    "NotSigned",
    "Get-FileHash",
    "test-nsis-preview-lifecycle.ps1",
    "preview-dist/LIFECYCLE.txt",
    "preview-dist/PREVIEW_GUI_LAUNCH.txt",
    "WebView2 missing on target and Windows 10/11 clean images: NOT TESTED",
    "Rust, Node.js, npm, MSVC, VS Build Tools: BUILD ONLY",
    "NSIS-OFFLINE-WEBVIEW2-REPORT-ONLY-",
    "retention-days: 7",
  ]) {
    assert.ok(workflow.includes(mark), "Missing offline NSIS proof/safety marker: " + mark);
  }
  assert.doesNotMatch(workflow, /pull_request_target\s*:|contents:\s*write|TAURI_SIGNING_PRIVATE_KEY|secrets\.|gh\s+release\s+create|action-gh-release/i);
  const artifact = workflow.slice(workflow.indexOf("uses: actions/upload-artifact@v4"));
  assert.ok(artifact.includes("preview-dist/OFFLINE_REPORT.txt"));
  assert.doesNotMatch(artifact, /(?:\.exe|bundle\/nsis|preview-dist\/\*|\bsetup\b)/i);
  assert.equal((workflow.match(/npm run tauri -- build --ci --bundles nsis/g) ?? []).length, 1);
});
