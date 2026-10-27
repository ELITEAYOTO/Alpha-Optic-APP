# CI ONLY — test two independently bundled NSIS versions, never a user PC.
# Both builds are UNSIGNED demonstration packages. No releases or updater keys.
param(
  [Parameter(Mandatory = $true)][string]$OldInstallerPath,
  [Parameter(Mandatory = $true)][string]$NewInstallerPath,
  [Parameter(Mandatory = $true)][string]$ReportPath
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if ($env:GITHUB_ACTIONS -ne 'true' -or
    $env:RUNNER_ENVIRONMENT -ne 'github-hosted' -or
    $env:RUNNER_OS -ne 'Windows' -or
    $env:GITHUB_REPOSITORY -ne 'ELITEAYOTO/Alpha-Optic-APP' -or
    -not $env:GITHUB_WORKSPACE -or -not $env:LOCALAPPDATA -or
    -not $env:APPDATA) {
  throw 'Upgrade smoke must run only on GitHub-hosted Windows in Optic Desktop.'
}

$bundleDir = [IO.Path]::GetFullPath((Join-Path $env:GITHUB_WORKSPACE 'src-tauri\target\release\bundle\nsis'))
$expectedOld = [IO.Path]::GetFullPath((Join-Path $bundleDir 'Optic Preview_0.0.1_x64-setup.exe'))
$expectedNew = [IO.Path]::GetFullPath((Join-Path $bundleDir 'Optic Preview_0.0.2_x64-setup.exe'))
$old = (Resolve-Path -LiteralPath $OldInstallerPath -ErrorAction Stop).Path
$new = (Resolve-Path -LiteralPath $NewInstallerPath -ErrorAction Stop).Path
if (-not [string]::Equals($old, $expectedOld, [StringComparison]::OrdinalIgnoreCase) -or
    -not [string]::Equals($new, $expectedNew, [StringComparison]::OrdinalIgnoreCase)) {
  throw 'Refusing installers other than the two exact CI-produced Preview NSIS files.'
}
foreach ($setup in @($old, $new)) {
  if (-not (Test-Path -LiteralPath $setup -PathType Leaf) -or
      (Get-AuthenticodeSignature -LiteralPath $setup).Status -ne 'NotSigned') {
    throw 'Only the two unsigned CI Preview installers may be exercised.'
  }
}
$oldHash = (Get-FileHash -LiteralPath $old -Algorithm SHA256).Hash
$newHash = (Get-FileHash -LiteralPath $new -Algorithm SHA256).Hash
if ($oldHash -eq $newHash) { throw 'Two distinct versioned setups unexpectedly match.' }

$expectedReport = [IO.Path]::GetFullPath((Join-Path $env:GITHUB_WORKSPACE 'upgrade-smoke-results\UPGRADE.txt'))
$report = [IO.Path]::GetFullPath((Join-Path $env:GITHUB_WORKSPACE $ReportPath))
$resultsDir = [IO.Path]::GetDirectoryName($expectedReport)
if (-not [string]::Equals($report, $expectedReport, [StringComparison]::OrdinalIgnoreCase) -or
    -not (Test-Path -LiteralPath $resultsDir -PathType Container)) {
  throw 'Report path must be upgrade-smoke-results/UPGRADE.txt in the CI workspace.'
}

$installDir = [IO.Path]::GetFullPath((Join-Path $env:LOCALAPPDATA 'Optic Preview'))
$uninstaller = Join-Path $installDir 'uninstall.exe'
$userUninstall = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall'
$machineUninstall = 'HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall'
$profileDir = [IO.Path]::GetFullPath((Join-Path $env:APPDATA 'dev.optic.desktop.preview'))
$probeFile = Join-Path $profileDir '__optic_upgrade_ci_sentinel__.txt'
$probeContent = 'OPTIC_UPGRADE_CI_SENTINEL_V1; synthetic non-secret, NOT user settings'

function PreviewRecords([string]$registryRoot) {
  return @(Get-ChildItem -LiteralPath $registryRoot -ErrorAction SilentlyContinue | ForEach-Object {
    $record = Get-ItemProperty -LiteralPath $_.PSPath
    $label = $record.PSObject.Properties['DisplayName']
    if ($null -ne $label -and $label.Value -eq 'Optic Preview') { $record }
  })
}

function Check-Installed([string]$expectedVersion) {
  $entries = @(PreviewRecords $userUninstall)
  if ($entries.Count -ne 1 -or $entries[0].DisplayVersion -ne $expectedVersion -or
      @(PreviewRecords $machineUninstall).Count -ne 0 -or
      -not (Test-Path -LiteralPath $uninstaller -PathType Leaf)) {
    throw "Preview HKCU version must be exactly $expectedVersion; never HKLM."
  }
  $appFiles = @(Get-ChildItem -LiteralPath $installDir -Filter '*.exe' -File |
    Where-Object { $_.Name -ne 'uninstall.exe' })
  if ($appFiles.Count -ne 1 -or $appFiles[0].Length -lt 1024) {
    throw 'Expected exactly one installed Preview application executable.'
  }
}

function Check-Sentinel {
  if (-not (Test-Path -LiteralPath $probeFile -PathType Leaf) -or
      [IO.File]::ReadAllText($probeFile) -cne $probeContent) {
    throw 'AppData synthetic sentinel was removed or modified.'
  }
}

function Invoke-Silent([string]$file, [string]$action) {
  $process = Start-Process -FilePath $file -ArgumentList '/S' -PassThru
  try {
    if (-not $process.WaitForExit(120000)) {
      $process.Kill($true)
      throw "$action exceeded the 120s CI timeout"
    }
    return $process.ExitCode
  } finally {
    $process.Dispose()
  }
}

if ((Test-Path -LiteralPath $installDir) -or
    (Test-Path -LiteralPath $profileDir) -or
    @(PreviewRecords $userUninstall).Count -ne 0 -or
    @(PreviewRecords $machineUninstall).Count -ne 0) {
  throw 'Preview installation/profile existed before the test; refusing to overwrite it.'
}

$errors = [System.Collections.Generic.List[string]]::new()
$installedOld = $false
$upgradedNew = $false
$downgradeBlocked = $false
$probeSurvived = $false
$uninstalled = $false
$probeCreated = $false

try {
  $exitCode = Invoke-Silent $old 'Install version 0.0.1'
  if ($exitCode -ne 0) { throw "0.0.1 setup returned $exitCode" }
  Check-Installed '0.0.1'
  $installedOld = $true

  [void](New-Item -ItemType Directory -Path $profileDir)
  [IO.File]::WriteAllText($probeFile, $probeContent)
  $probeCreated = $true
  Check-Sentinel

  $exitCode = Invoke-Silent $new 'Upgrade to version 0.0.2'
  if ($exitCode -ne 0) { throw "0.0.2 upgrade returned $exitCode" }
  Check-Installed '0.0.2'
  Check-Sentinel
  $upgradedNew = $true

  # Refuse *silent* downgrade. We do not assume the exit code convention:
  # confirmation is the installed version still being 0.0.2 and probe intact.
  $downgradeExit = Invoke-Silent $old 'Attempt silent downgrade to 0.0.1'
  Check-Installed '0.0.2'
  Check-Sentinel
  $downgradeBlocked = $true
  $probeSurvived = $true
} catch {
  $errors.Add($_.Exception.Message)
} finally {
  # Uninstall only through the exact application-owned uninstaller.
  if (Test-Path -LiteralPath $uninstaller -PathType Leaf) {
    try {
      $exitCode = Invoke-Silent $uninstaller 'Preview cleanup'
      if ($exitCode -ne 0) { throw "Uninstaller returned $exitCode" }
      $deadline = [DateTime]::UtcNow.AddSeconds(30)
      do {
        $registryCount = @(PreviewRecords $userUninstall).Count +
                         @(PreviewRecords $machineUninstall).Count
        $installRemains = Test-Path -LiteralPath $installDir
        if ($registryCount -eq 0 -and -not $installRemains) { break }
        Start-Sleep -Milliseconds 500
      } while ([DateTime]::UtcNow -lt $deadline)
      if ($registryCount -ne 0 -or $installRemains) {
        throw 'NSIS left installed files or registry records after uninstallation.'
      }
      if ($probeCreated) { Check-Sentinel }
      $uninstalled = $true
    } catch {
      $errors.Add("Cleanup: $($_.Exception.Message)")
    }
  } else {
    $errors.Add('Cleanup: no owned uninstaller available; discard the ephemeral runner.')
  }

  # Never recursively delete a profile; remove only the sentinel created by us.
  if ($probeCreated) {
    try {
      if (Test-Path -LiteralPath $probeFile -PathType Leaf) {
        Remove-Item -LiteralPath $probeFile -Force
      }
      if ((Test-Path -LiteralPath $profileDir -PathType Container) -and
          @(Get-ChildItem -LiteralPath $profileDir -Force).Count -eq 0) {
        Remove-Item -LiteralPath $profileDir
      }
    } catch { $errors.Add("Synthetic sentinel cleanup: $($_.Exception.Message)") }
  }
}

$pass = $errors.Count -eq 0 -and $installedOld -and $upgradedNew -and
        $downgradeBlocked -and $probeSurvived -and $uninstalled
@(
  'OPTIC PREVIEW CI-ONLY VERSION TRANSITION — NOT A RELEASE'
  "Source SHA: $env:GITHUB_SHA"
  "0.0.1 NSIS SHA256: $oldHash"
  "0.0.2 NSIS SHA256: $newHash"
  "0.0.1 installed in HKCU: $installedOld"
  "0.0.2 replaced 0.0.1 in HKCU: $upgradedNew"
  "Silent 0.0.1 downgrade refused: $downgradeBlocked"
  "External synthetic AppData sentinel preserved: $probeSurvived"
  "Uninstalled and owned binary files cleaned: $uninstalled"
  'Real user settings, code migration, updater signature: NOT TESTED'
  'Windows 10/11 clean images, WebView2 absent: NOT TESTED'
  'No installation performed on a user PC or in the Bridge repository'
  "Result: $(if ($pass) { 'PASS' } else { 'FAIL' })"
  $errors
) | Set-Content -LiteralPath $report -Encoding utf8
Get-Content -LiteralPath $report
if (-not $pass) { throw 'Unsigned two-version NSIS CI upgrade smoke FAILED.' }
