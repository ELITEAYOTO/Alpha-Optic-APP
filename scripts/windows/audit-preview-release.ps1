# Read-only audit of a FUTURE signed Optic Preview Release asset.
# Never publishes a Release, launches downloaded code or installs on a user PC.
# Supplied SHA, source commit and publisher pin must be approved independently.
param(
  [Parameter(Mandatory = $true)][string]$ReleaseTag,
  [Parameter(Mandatory = $true)][string]$ExpectedSourceSha,
  [Parameter(Mandatory = $true)][string]$ExpectedSha256,
  [Parameter(Mandatory = $true)][string]$ExpectedPublisherThumbprint
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if ($env:GITHUB_ACTIONS -ne 'true' -or
    $env:RUNNER_ENVIRONMENT -ne 'github-hosted' -or
    $env:RUNNER_OS -ne 'Windows' -or
    $env:GITHUB_REPOSITORY -ne 'ELITEAYOTO/Alpha-Optic-APP' -or
    $env:GITHUB_REF -ne 'refs/heads/main' -or
    -not $env:GITHUB_WORKSPACE -or
    -not $env:RUNNER_TEMP -or -not $env:GH_TOKEN) {
  throw 'Signed Preview audit is restricted to GitHub-hosted Windows on the official main branch.'
}
if ($ReleaseTag -cnotmatch '^v(?<version>(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)-preview\.(?:0|[1-9]\d*))$' -or
    $ReleaseTag -eq 'v0.0.1-preview.0') {
  throw 'Expected an explicit versioned vX.Y.Z-preview.N tag.'
}
$version = $Matches.version
if ($ExpectedSourceSha -cnotmatch '^[0-9a-fA-F]{40}$' -or
    $ExpectedSha256 -cnotmatch '^[0-9a-fA-F]{64}$' -or
    $ExpectedPublisherThumbprint -cnotmatch '^[0-9a-fA-F]{40}$' -or
    $ExpectedPublisherThumbprint -match '^0{40}$') {
  throw 'Expected an independently verified source SHA, installer SHA-256 and non-zero publisher thumbprint.'
}
$assetName = 'Optic Preview_' + $version + '_x64-setup.exe'
if ($env:GITHUB_WORKSPACE -ne (Get-Location).Path) {
  throw 'Execute only from the GitHub checkout workspace.'
}
$tagRef = 'refs/tags/' + $ReleaseTag + '^{commit}'
$tagCommit = (& git rev-parse $tagRef 2>$null)
if ($LASTEXITCODE -ne 0 -or -not $tagCommit -or
    $tagCommit.Trim() -cne $ExpectedSourceSha.ToLowerInvariant()) {
  throw 'The tag does not resolve to the independently approved source commit.'
}
& git merge-base --is-ancestor $ExpectedSourceSha 'origin/main'
if ($LASTEXITCODE -ne 0) {
  throw 'The signed candidate source commit is not contained in main.'
}

$releaseJson = & gh release view $ReleaseTag --repo $env:GITHUB_REPOSITORY --json 'tagName,isDraft,isPrerelease,assets'
if ($LASTEXITCODE -ne 0 -or -not $releaseJson) {
  throw 'Cannot inspect the official GitHub Preview release.'
}
$release = ($releaseJson | Out-String | ConvertFrom-Json -ErrorAction Stop)
if ($release.tagName -cne $ReleaseTag -or
    (-not $release.isDraft -and -not $release.isPrerelease)) {
  throw 'Expected an exactly matching draft or prerelease, not a stable release.'
}
$assets = @($release.assets)
$matchingAssets = @($assets | Where-Object { $_.name -ceq $assetName })
if ($matchingAssets.Count -ne 1 -or
    @($assets | Where-Object { $_.name -like 'Optic*setup.exe' }).Count -ne 1) {
  throw 'Release must contain exactly one expected Preview setup and no alternate Optic setup.'
}
if ($matchingAssets[0].size -lt 1024) {
  throw 'The release asset is unexpectedly small.'
}

# Fixed runner-owned directory; refuse a pre-existing one, including from other jobs.
$downloadDir = Join-Path $env:RUNNER_TEMP 'optic-preview-release-audit'
if (Test-Path -LiteralPath $downloadDir) {
  throw 'Audit download directory already exists; refusing to overwrite it.'
}
[void](New-Item -Path $downloadDir -ItemType Directory -ErrorAction Stop)
& gh release download $ReleaseTag --repo $env:GITHUB_REPOSITORY --pattern $assetName --dir $downloadDir
if ($LASTEXITCODE -ne 0) {
  throw 'Failed to fetch the specific Preview setup from the official Release.'
}
$downloaded = @(Get-ChildItem -LiteralPath $downloadDir -File)
if ($downloaded.Count -ne 1 -or $downloaded[0].Name -cne $assetName) {
  throw 'Unexpected download directory contents; refusing asset verification.'
}
$installer = $downloaded[0].FullName

# Independent existing fail-closed check: exact SHA-256 and valid pinned Authenticode.
& './scripts/windows/verify-optic-installer.ps1' -InstallerPath $installer -ExpectedSha256 $ExpectedSha256 -ExpectedPublisherThumbprint $ExpectedPublisherThumbprint
if ($LASTEXITCODE -ne 0) {
  throw 'Signed Preview inspector did not complete successfully.'
}
$reportDir = Join-Path $env:GITHUB_WORKSPACE 'preview-release-audit'
if (Test-Path -LiteralPath $reportDir) {
  throw 'Audit report directory already exists; refusing to overwrite it.'
}
[void](New-Item -Path $reportDir -ItemType Directory -ErrorAction Stop)
@(
  'OPTIC PREVIEW RELEASE: SIGNATURE/HASH/SOURCE AUDIT PASS; NOT DISTRIBUTION APPROVAL'
  "Source SHA: $($ExpectedSourceSha.ToLowerInvariant())"
  "Tag: $ReleaseTag"
  "File: $assetName"
  "SHA256: $($ExpectedSha256.ToUpperInvariant())"
  "Publisher thumbprint: $($ExpectedPublisherThumbprint.ToUpperInvariant())"
  "Draft: $($release.isDraft); prerelease: $($release.isPrerelease)"
  'An independently authorized signing identity and Windows 10/11 qualification remain necessary.'
  'No downloaded setup was executed, no certificate trust was changed, no release was published.'
  'Updater: OFF; Optic AI Bridge: NOT touched; user PC: NOT touched.'
) | Set-Content -LiteralPath (Join-Path $reportDir 'AUDIT.txt') -Encoding utf8
Get-Content -LiteralPath (Join-Path $reportDir 'AUDIT.txt')
