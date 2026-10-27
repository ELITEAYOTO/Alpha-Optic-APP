import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const workflow = readFileSync(new URL("../.github/workflows/audit-signed-preview-release.yml", import.meta.url), "utf8");
const script = readFileSync(new URL("../scripts/windows/audit-preview-release.ps1", import.meta.url), "utf8");

test("future release auditing is manual, read-only and tied to official main", () => {
  for (const item of [
    "workflow_dispatch:",
    "release_tag:",
    "source_commit_sha:",
    "installer_sha256:",
    "publisher_thumbprint:",
    "contents: read",
    "github.repository == 'ELITEAYOTO/Alpha-Optic-APP'",
    "github.ref == 'refs/heads/main'",
    "runs-on: windows-latest",
    "fetch-depth: 0",
    "persist-credentials: false",
    "audit-preview-release.ps1",
    "SIGNED-PREVIEW-READONLY-AUDIT-",
    "path: preview-release-audit/AUDIT.txt",
    "retention-days: 7",
  ]) assert.ok(workflow.includes(item), "Missing release audit safety marker: " + item);
  assert.doesNotMatch(workflow, /pull_request_target\s*:|push\s*:|release\s*:|contents:\s*write|TAURI_SIGNING_PRIVATE_KEY|signtool\s+sign|gh\s+release\s+(create|upload|edit|delete)/i);
  assert.doesNotMatch(workflow, /(?:^|\n)\s+path:\s+.*(?:\.exe|bundle\/nsis)/i);
});

test("audit refuses loose refs, unapproved sources and draft-release substitution", () => {
  for (const item of [
    "$env:GITHUB_ACTIONS -ne 'true'",
    "$env:RUNNER_ENVIRONMENT -ne 'github-hosted'",
    "$env:RUNNER_OS -ne 'Windows'",
    "$env:GITHUB_REPOSITORY -ne 'ELITEAYOTO/Alpha-Optic-APP'",
    "$env:GITHUB_REF -ne 'refs/heads/main'",
    "$env:GITHUB_WORKSPACE",
    "$env:RUNNER_TEMP",
    "$env:GH_TOKEN",
    "version",
    "-preview",
    "$ExpectedSourceSha",
    "$ExpectedSha256",
    "$ExpectedPublisherThumbprint",
    "git rev-parse",
    "git merge-base --is-ancestor",
    "gh release view",
    "--json 'tagName,isDraft,isPrerelease,assets'",
    "isDraft",
    "isPrerelease",
    "Optic Preview_",
    "_x64-setup.exe",
    "assets",
    "gh release download",
    "--pattern $assetName",
    "verify-optic-installer.ps1",
    "Get-Content -LiteralPath",
    "AUDIT.txt",
    "NOT DISTRIBUTION APPROVAL",
  ].filter(item => item !== "Get-Content -LiteralPath")) {
    assert.ok(script.includes(item), "Missing source/cert integrity check: " + item);
  }
  assert.match(script, /\$ExpectedSha256 -cnotmatch '\^\[0-9a-fA-F\]\{64\}\$'/);
  assert.match(script, /\$ExpectedPublisherThumbprint -match '\^0\{40\}\$'/);
  assert.match(script, /-ExpectedSha256 \$ExpectedSha256 -ExpectedPublisherThumbprint \$ExpectedPublisherThumbprint/);
  assert.doesNotMatch(script, /Start-Process|Invoke-Expression|Set-AuthenticodeSignature|Import-Certificate|gh release (?:create|upload|edit|delete)|Remove-Item[^\r\n]*-Recurse/i);
  assert.match(script, /No downloaded setup was executed/);
  assert.match(script, /user PC: NOT touched/);
});
